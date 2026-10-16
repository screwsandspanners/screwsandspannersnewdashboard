import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* =========================================================
   CONFIG
   Your Customer page already calls /admin/all-users on this server,
   so the admin badge routes should be here too.
   For local testing use: "http://localhost:3009/api/v1"
========================================================= */

const BADGE_API_BASE = "https://meemaw.sands.com.ng/api/v1";

const getAuthToken = () =>
  localStorage.getItem("authToken") ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("token") ||
  localStorage.getItem("access_token") ||
  "";

const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* =========================================================
   ROW HELPERS
   Badge fields can sit on the row (after we update it)
   or inside row.business (from the API).
========================================================= */

const pick = (row, key) => row?.[key] ?? row?.business?.[key];

// Only Service Providers can be badged.
// Matches "SP", "sp", "Service Provider", "service_provider", "serviceprovider"
export const isSP = (row) => {
  const type = String(row?.type || "").toLowerCase().replace(/[^a-z]/g, "");
  return type === "sp" || type === "serviceprovider";
};

export const isBadged = (row) => String(pick(row, "badge") ?? "0") === "1";

export const isSuspended = (row) =>
  ["1", "true"].includes(String(pick(row, "badge_suspended") ?? "0").toLowerCase());

const getExpiry = (row) => pick(row, "badge_expiry_date") || null;

const isExpired = (row) => {
  const expiry = getExpiry(row);
  if (!expiry) return false;
  const d = new Date(expiry);
  return !Number.isNaN(d.getTime()) && d.getTime() < Date.now();
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const toApiId = (id) => (Number.isNaN(Number(id)) ? id : Number(id));

/* =========================================================
   API CALLS
========================================================= */

async function badgeRequest(path, { json, formData } = {}) {
  const headers = { ...authHeaders() };
  if (json) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BADGE_API_BASE}/admin/${path}`, {
    method: "PATCH",
    headers,
    body: json ? JSON.stringify(json) : formData,
  });
  const result = await res.json().catch(() => ({}));
  console.log(`[${path}] sent:`, json || "(file)", "got:", result);
  if (!res.ok || result.success === false) {
    throw new Error(result.message || "Request failed");
  }
  return result.data;
}

// The backend FLIPS the badge: OFF becomes ON, ON becomes OFF
const toggleBadge = (ids) => badgeRequest("toggle-sp-badge", { json: { user_ids: ids.map(toApiId) } });

const toggleBadgeCsv = (file) => {
  const formData = new FormData();
  formData.append("csv", file);
  return badgeRequest("toggle-sp-badge-csv", { formData });
};

const toggleSuspend = (ids) => badgeRequest("suspend-sp-badge", { json: { user_ids: ids.map(toApiId) } });

const updateExpiry = (ids, date) =>
  badgeRequest("update-sp-badge-expiry", {
    json: { user_ids: ids.map(toApiId), badge_expiry_date: date },
  });

// Builds a small CSV (User ID, SP Name) with only the users we want to flip
const csvCell = (v) => {
  const t = String(v ?? "");
  return /[",\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};

function buildCsvFile(rows) {
  const lines = ["User ID,SP Name", ...rows.map((r) => `${csvCell(r.id)},${csvCell(r.name)}`)];
  return new File([lines.join("\r\n")], "sp_badge_import.csv", { type: "text/csv" });
}

// Reads the "User ID" column so the admin sees what is in the file
async function readUserIdsFromCsv(file) {
  const text = (await file.text()).replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const clean = (v) => v.trim().replace(/^"|"$/g, "").trim();
  const header = lines[0].split(",").map((h) => clean(h).toLowerCase());
  const idx = header.indexOf("user id");
  if (idx === -1) return [];

  const ids = lines
    .slice(1)
    .map((l) => clean(l.split(",")[idx] || ""))
    .filter((v) => /^\d+$/.test(v));
  return [...new Set(ids)];
}

/* =========================================================
   BADGE ICON
   gold = badged, grey = not badged, red = suspended, orange = expired
========================================================= */

export function BadgeIcon({ state }) {
  const colors = { on: "#f5b301", off: "#c8c8c8", suspended: "#e5484d", expired: "#f97316" };
  const labels = {
    on: "SP badge on",
    off: "SP badge off",
    suspended: "SP badge suspended",
    expired: "SP badge expired",
  };
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={colors[state] || colors.off}>
      <title>{labels[state] || labels.off}</title>
      <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
    </svg>
  );
}

const iconState = (row) => {
  if (!isBadged(row)) return "off";
  if (isSuspended(row)) return "suspended";
  if (isExpired(row)) return "expired";
  return "on";
};

/* =========================================================
   HOOK
   setUsers = your setAllUsers
   refetch  = your fetchAllUsers
   users    = your allUsers
========================================================= */

const FIELDS = ["badge", "badge_start_date", "badge_expiry_date", "badge_suspended"];

export function useSpBadge(setUsers, refetch, users = []) {
  const [filter, setFilter] = useState("all"); // all | sp | badged | not
  const [selectedIds, setSelectedIds] = useState([]);
  const [savingIds, setSavingIds] = useState([]);
  const [bulkConfirm, setBulkConfirm] = useState(null); // { ids, on, off }
  const [csvPending, setCsvPending] = useState(null); // { file, count, onRows, offRows, unknown, badgedAction }
  const [suspendConfirm, setSuspendConfirm] = useState(null); // { row }
  const [expiryDialog, setExpiryDialog] = useState(null); // { ids, date }
  const [submitting, setSubmitting] = useState(false);
  const csvInputRef = useRef(null);

  const byId = useMemo(() => new Map(users.map((u) => [String(u.id), u])), [users]);

  const markSaving = (ids, on) =>
    setSavingIds((prev) =>
      on ? [...prev, ...ids.map(String)] : prev.filter((id) => !ids.map(String).includes(id))
    );

  // Change rows in the table without reloading
  const patchRows = useCallback(
    (ids, patch) => {
      const set = new Set(ids.map(String));
      setUsers((prev) =>
        prev.map((r) =>
          set.has(String(r.id)) ? { ...r, ...(typeof patch === "function" ? patch(r) : patch) } : r
        )
      );
    },
    [setUsers]
  );

  // Use the server's "updated" list if it sent one
  const applyUpdated = useCallback(
    (updated = []) => {
      const map = new Map(updated.map((u) => [Number(u.user_id), u]));
      setUsers((prev) =>
        prev.map((r) => {
          const u = map.get(Number(r.id));
          if (!u) return r;
          const patch = {};
          FIELDS.forEach((f) => {
            if (u[f] !== undefined) patch[f] = f === "badge" ? String(u[f]) : u[f];
          });
          return { ...r, ...patch };
        })
      );
    },
    [setUsers]
  );

  // After a toggle: use the server list, or flip the rows ourselves
  const applyToggleResult = (data, ids) => {
    if (Array.isArray(data?.updated) && data.updated.length) {
      applyUpdated(data.updated);
      return;
    }
    patchRows(ids, (r) => {
      if (isBadged(r)) return { badge: "0" };
      const now = new Date();
      const end = new Date(now);
      end.setMonth(end.getMonth() + 12); // backend default: 12 months
      return { badge: "1", badge_start_date: now.toISOString(), badge_expiry_date: end.toISOString() };
    });
  };

  /* ---------- 1. one switch on one row ---------- */

  const handleSingleToggle = useCallback(
    async (row) => {
      const wasOn = isBadged(row);
      markSaving([row.id], true);
      try {
        const data = await toggleBadge([row.id]);
        applyToggleResult(data, [row.id]);
        toast.success(`Badge ${wasOn ? "removed from" : "added to"} ${row.name || row.id}`);
      } catch (err) {
        toast.error(err.message || "Failed to update badge");
      } finally {
        markSaving([row.id], false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /* ---------- 2. many selected rows ---------- */

  const openBulkConfirm = () => {
    const rows = selectedIds.map((id) => byId.get(String(id))).filter(Boolean);
    const on = rows.filter((r) => !isBadged(r)).length; // will turn ON
    const off = rows.length - on; // will turn OFF
    setBulkConfirm({ ids: rows.map((r) => r.id), on, off });
  };

  const confirmBulk = async () => {
    setSubmitting(true);
    try {
      const data = await toggleBadge(bulkConfirm.ids);
      applyToggleResult(data, bulkConfirm.ids);
      toast.success(`${data?.updated_count ?? bulkConfirm.ids.length} SP(s) updated`);
      setBulkConfirm(null);
    } catch (err) {
      toast.error(err.message || "Failed to update badges");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- 3. CSV ---------- */

  const handleCsvChosen = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the admin pick the same file again
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Only .csv files are supported (not .xlsx or .xls).");
      return;
    }
    const ids = await readUserIdsFromCsv(file);
    console.log("[csv] user ids found in file:", ids);
    if (!ids.length) {
      toast.error('No valid User IDs found. The file needs a "User ID" column.');
      return;
    }

    const rows = ids.map((id) => byId.get(String(id))).filter((r) => r && isSP(r));
    if (!rows.length) {
      toast.error("None of the IDs in this file match an SP in the table.");
      return;
    }
    const onRows = rows.filter((r) => !isBadged(r)); // currently OFF -> would turn ON
    const offRows = rows.filter((r) => isBadged(r)); // currently ON  -> would turn OFF
    setCsvPending({
      file,
      count: ids.length,
      onRows,
      offRows,
      unknown: ids.length - rows.length,
      badgedAction: "retain", // used only when the file has both kinds
    });
  };

  const confirmCsv = async () => {
    const { onRows, offRows, badgedAction } = csvPending;

    // Already-badged users are flipped (badge removed) only if the admin chose that,
    // or if every user in the file is already badged and the admin confirmed.
    const removeBadged = onRows.length === 0 || badgedAction === "remove";
    const toSend = [...onRows, ...(removeBadged ? offRows : [])];

    if (!toSend.length) {
      toast.info("Nothing to change.");
      setCsvPending(null);
      return;
    }

    setSubmitting(true);
    try {
      // Upload a CSV with only the chosen users, so "retained" badges are never touched
      const data = await toggleBadgeCsv(buildCsvFile(toSend));
      toast.success(`${data?.updated_count ?? 0} SP(s) updated from CSV`);
      setCsvPending(null);
      refetch?.(); // reload so the table matches the backend
    } catch (err) {
      toast.error(err.message || "CSV upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- 4. suspend / unsuspend ---------- */

  const confirmSuspend = async () => {
    const row = suspendConfirm.row;
    const wasSuspended = isSuspended(row);
    setSubmitting(true);
    try {
      const data = await toggleSuspend([row.id]);
      if (Array.isArray(data?.updated) && data.updated.length) applyUpdated(data.updated);
      else patchRows([row.id], { badge_suspended: wasSuspended ? 0 : 1 });
      toast.success(`Badge ${wasSuspended ? "unsuspended" : "suspended"} for ${row.name || row.id}`);
      setSuspendConfirm(null);
    } catch (err) {
      toast.error(err.message || "Failed to update suspension");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- 5. edit expiry date ---------- */

  const openExpiry = (ids, currentDate) =>
    setExpiryDialog({ ids, date: currentDate ? String(currentDate).slice(0, 10) : "" });

  const confirmExpiry = async () => {
    const { ids, date } = expiryDialog;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      toast.error("Please choose an expiry date.");
      return;
    }
    setSubmitting(true);
    try {
      await updateExpiry(ids, date);
      patchRows(ids, { badge_expiry_date: date });
      toast.success(`Expiry date updated for ${ids.length} SP(s)`);
      setExpiryDialog(null);
    } catch (err) {
      toast.error(err.message || "Failed to update expiry date");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- table columns ---------- */

  const columns = useMemo(
    () => [
      // Icon + on/off switch
      {
        field: "spBadge",
        headerName: "SP Badge",
        width: 150,
        sortable: true,
        filterable: false,
        valueGetter: (value, row) => (isSP(row) ? (isBadged(row) ? 1 : 0) : -1),
        renderCell: (params) => {
          const row = params.row;
          if (!isSP(row)) return <span style={{ color: "#9ca3af" }}>N/A</span>;
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <BadgeIcon state={iconState(row)} />
              <Switch
                size="small"
                checked={isBadged(row)}
                disabled={savingIds.includes(String(row.id))}
                onChange={() => handleSingleToggle(row)}
                inputProps={{ "aria-label": "Toggle SP badge" }}
              />
            </Box>
          );
        },
      },

      // Suspend / Unsuspend
      {
        field: "spBadgeSuspended",
        headerName: "Badge Suspension",
        width: 170,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const row = params.row;
          if (!isSP(row) || !isBadged(row)) return <span style={{ color: "#9ca3af" }}>N/A</span>;
          const suspended = isSuspended(row);
          return (
            <Button
              size="small"
              variant="outlined"
              color={suspended ? "success" : "error"}
              onClick={() => setSuspendConfirm({ row })}
            >
              {suspended ? "Unsuspend" : "Suspend"}
            </Button>
          );
        },
      },

      // Expiry date + edit
      {
        field: "spBadgeExpiry",
        headerName: "Badge Expires",
        width: 210,
        sortable: true,
        filterable: false,
        type: "date",
        valueGetter: (value, row) => {
          if (!isSP(row) || !isBadged(row) || !getExpiry(row)) return null;
          const d = new Date(getExpiry(row));
          return Number.isNaN(d.getTime()) ? null : d;
        },
        renderCell: (params) => {
          const row = params.row;
          if (!isSP(row) || !isBadged(row)) return <span style={{ color: "#9ca3af" }}>N/A</span>;
          const expired = isExpired(row);
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: 13, color: expired ? "#dc2626" : "inherit" }}>
                {formatDate(getExpiry(row))}
                {expired ? " (expired)" : ""}
              </Typography>
              <Button size="small" onClick={() => openExpiry([row.id], getExpiry(row))}>
                Edit
              </Button>
            </Box>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savingIds, handleSingleToggle]
  );

  // Filter: All users | All SP | Badged SP | Non-badged SP
  const applyFilter = useCallback(
    (list) => {
      if (filter === "all") return list;
      const sp = list.filter(isSP);
      if (filter === "badged") return sp.filter(isBadged);
      if (filter === "not") return sp.filter((r) => !isBadged(r));
      return sp;
    },
    [filter]
  );

  // DataGrid selection (works with both array and { ids: Set } formats)
  const setSelection = useCallback((model) => {
    const ids = Array.isArray(model) ? model : Array.from(model?.ids ?? []);
    setSelectedIds(ids);
  }, []);

  return {
    columns,
    filter,
    setFilter,
    applyFilter,
    selectedIds,
    setSelection,
    openBulkConfirm,
    bulkConfirm,
    setBulkConfirm,
    confirmBulk,
    csvPending,
    setCsvPending,
    handleCsvChosen,
    confirmCsv,
    csvInputRef,
    suspendConfirm,
    setSuspendConfirm,
    confirmSuspend,
    expiryDialog,
    setExpiryDialog,
    openExpiry,
    confirmExpiry,
    submitting,
  };
}

/* =========================================================
   TOOLBAR: filter + bulk buttons + CSV import
========================================================= */

export function SpBadgeToolbar({ badge }) {
  const none = !badge.selectedIds.length;
  return (
    <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
      <FormControl size="small" sx={{ minWidth: 190 }}>
        <InputLabel>SP badge</InputLabel>
        <Select label="SP badge" value={badge.filter} onChange={(e) => badge.setFilter(e.target.value)}>
          <MenuItem value="all">All users</MenuItem>
          <MenuItem value="sp">All SP</MenuItem>
          <MenuItem value="badged">Badged SP</MenuItem>
          <MenuItem value="not">Non-badged SP</MenuItem>
        </Select>
      </FormControl>

      <Button variant="contained" size="small" disabled={none} onClick={badge.openBulkConfirm}>
        Toggle badge for selected ({badge.selectedIds.length})
      </Button>

      <Button
        variant="outlined"
        size="small"
        disabled={none}
        onClick={() => badge.openExpiry(badge.selectedIds, "")}
      >
        Set expiry for selected
      </Button>

      <Button variant="outlined" color="success" size="small" onClick={() => badge.csvInputRef.current?.click()}>
        Import CSV
      </Button>
      <input ref={badge.csvInputRef} type="file" accept=".csv" hidden onChange={badge.handleCsvChosen} />

      <Typography variant="caption" color="text.secondary">
        Toggle flips the badge: OFF becomes ON and ON becomes OFF. CSV needs "User ID" and "SP Name" columns; if it has already-badged users you choose to retain or turn them off.
      </Typography>
    </Box>
  );
}

/* =========================================================
   CONFIRMATION DIALOGS
========================================================= */

function NameList({ rows }) {
  return (
    <Box
      sx={{
        maxHeight: 140,
        overflowY: "auto",
        border: "1px solid #e5e7eb",
        borderRadius: 1,
        p: 1,
        my: 0.5,
      }}
    >
      {rows.map((r) => (
        <Typography key={r.id} sx={{ fontSize: 13 }}>
          {r.name || "N/A"} <span style={{ color: "#9ca3af" }}>(ID {r.id})</span>
        </Typography>
      ))}
    </Box>
  );
}

export function SpBadgeDialogs({ badge }) {
  const { bulkConfirm, csvPending, suspendConfirm, expiryDialog, submitting } = badge;
  const suspendedNow = suspendConfirm ? isSuspended(suspendConfirm.row) : false;

  // CSV cases: everyone already badged / nobody badged / a mix
  const csvAllBadged = Boolean(csvPending) && csvPending.onRows.length === 0;
  const csvNoneBadged = Boolean(csvPending) && csvPending.offRows.length === 0;
  const csvMixed = Boolean(csvPending) && !csvAllBadged && !csvNoneBadged;

  return (
    <>
      {/* selected rows */}
      <Dialog open={Boolean(bulkConfirm)} onClose={() => !submitting && badge.setBulkConfirm(null)}>
        <DialogTitle>Toggle the badge for the selected users?</DialogTitle>
        <DialogContent>
          <Typography>{bulkConfirm?.on} SP(s) will be badged (currently off).</Typography>
          <Typography>{bulkConfirm?.off} SP(s) will lose the badge (currently on).</Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={submitting} onClick={() => badge.setBulkConfirm(null)}>
            No
          </Button>
          <Button variant="contained" disabled={submitting} onClick={badge.confirmBulk}>
            {submitting ? "Saving..." : "Yes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSV import */}
      <Dialog
        open={Boolean(csvPending)}
        onClose={() => !submitting && badge.setCsvPending(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {csvAllBadged
            ? "All users in this file already have the badge"
            : csvNoneBadged
            ? "Badge all users in this file?"
            : "Some users in this file are already badged"}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            <strong>{csvPending?.file?.name}</strong> contains {csvPending?.count} unique user ID(s).
          </Typography>

          {csvPending && !csvAllBadged && (
            <>
              <Typography sx={{ mt: 1, fontWeight: 600 }}>
                {csvPending.onRows.length} not yet badged (will be badged):
              </Typography>
              <NameList rows={csvPending.onRows} />
            </>
          )}

          {csvPending && !csvNoneBadged && (
            <>
              <Typography sx={{ mt: 1, fontWeight: 600 }}>
                {csvPending.offRows.length} already badged:
              </Typography>
              <NameList rows={csvPending.offRows} />
            </>
          )}

          {csvAllBadged && (
            <Typography sx={{ mt: 1 }} color="error">
              Are you sure you want to turn OFF the badge for all {csvPending.offRows.length} of them?
            </Typography>
          )}

          {csvMixed && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontWeight: 600 }}>What should happen to the already badged users?</Typography>
              <RadioGroup
                value={csvPending.badgedAction}
                onChange={(e) => badge.setCsvPending((p) => ({ ...p, badgedAction: e.target.value }))}
              >
                <FormControlLabel value="retain" control={<Radio size="small" />} label="Retain their badge (leave them as they are)" />
                <FormControlLabel value="remove" control={<Radio size="small" />} label="Turn OFF their badge" />
              </RadioGroup>
            </Box>
          )}

          {csvPending?.unknown > 0 && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {csvPending.unknown} ID(s) were not found among SP users in this table and will be skipped.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button disabled={submitting} onClick={() => badge.setCsvPending(null)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={csvAllBadged ? "error" : "primary"}
            disabled={submitting}
            onClick={badge.confirmCsv}
          >
            {submitting
              ? "Uploading..."
              : csvAllBadged
              ? "Yes, turn off badge"
              : csvNoneBadged
              ? "Yes, badge them"
              : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* suspend / unsuspend */}
      <Dialog open={Boolean(suspendConfirm)} onClose={() => !submitting && badge.setSuspendConfirm(null)}>
        <DialogTitle>{suspendedNow ? "Unsuspend this badge?" : "Suspend this badge?"}</DialogTitle>
        <DialogContent>
          <Typography>{suspendConfirm?.row?.name}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Suspending does not pause or extend the expiry date.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={submitting} onClick={() => badge.setSuspendConfirm(null)}>
            No
          </Button>
          <Button variant="contained" disabled={submitting} onClick={badge.confirmSuspend}>
            {submitting ? "Saving..." : "Yes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* expiry date */}
      <Dialog open={Boolean(expiryDialog)} onClose={() => !submitting && badge.setExpiryDialog(null)}>
        <DialogTitle>Set badge expiry date</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            This will update {expiryDialog?.ids?.length} SP(s). It does not change the badge or suspension.
          </Typography>
          <TextField
            type="date"
            size="small"
            label="Expiry date"
            InputLabelProps={{ shrink: true }}
            value={expiryDialog?.date || ""}
            onChange={(e) => badge.setExpiryDialog((p) => ({ ...p, date: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={submitting} onClick={() => badge.setExpiryDialog(null)}>
            Cancel
          </Button>
          <Button variant="contained" disabled={submitting} onClick={badge.confirmExpiry}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}