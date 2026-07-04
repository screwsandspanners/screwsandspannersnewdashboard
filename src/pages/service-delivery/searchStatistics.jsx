import React, { useState, useEffect } from "react"

function readableTimestamp(value) {
  if (value === undefined || value === null || value === "") return ""

  const timestamp = String(value).trim()
  const numericTimestamp = /^\d+$/.test(timestamp) ? Number(timestamp) : timestamp
  const date = new Date(numericTimestamp)

  if (isNaN(date)) return timestamp

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

function downloadCSV(filename, rows) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csv = [headers.join(",")].concat(
    rows.map(r =>
      headers.map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")
    )
  ).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function firstValue(source, keys) {
  for (const key of keys) {
    if (source?.[key] !== undefined && source[key] !== null && source[key] !== "") {
      return source[key]
    }
  }

  return ""
}

function asList(value) {
  if (Array.isArray(value)) return value
  if (value === undefined || value === null || value === "") return []
  if (typeof value === "string") {
    return value.split(",").map(v => v.trim()).filter(Boolean)
  }

  return [value]
}

function itemName(item) {
  const directName = firstValue(item, [
    "ItemName",
    "itemName",
    "item_name",
    "name",
    "fullName",
    "fullname",
    "businessName",
    "business_name"
  ])

  if (directName) return directName

  const firstName = firstValue(item, ["firstname", "firstName", "first_name"])
  const lastName = firstValue(item, ["lastname", "lastName", "last_name"])

  return [firstName, lastName].filter(Boolean).join(" ")
}

function normalizeSelectedItems(searchRow) {
  const selected = firstValue(searchRow, [
    "selected_search_item",
    "selectedSearchItem",
    "selected_items",
    "selectedItems",
    "items"
  ])

  const selectedItems = Array.isArray(selected) ? selected : selected ? [selected] : []

  if (selectedItems.length) {
    return selectedItems.map(item => ({
      id: firstValue(item, ["itemIds", "itemId", "item_id", "ItemID", "ItemId", "id", "_id"]),
      name: itemName(item),
      rating: firstValue(item, ["Rating", "rating", "itemRating", "ItemRating", "averageRating", "average_rating"])
    }))
  }

  const itemIds = asList(firstValue(searchRow, ["itemIds", "item_ids", "ItemIDs", "ItemIds", "itemId", "item_id"]))
  const itemNames = asList(firstValue(searchRow, ["ItemName", "itemName", "item_name", "itemNames", "item_names"]))
  const ratings = asList(firstValue(searchRow, ["Rating", "rating", "ratings", "itemRatings", "item_ratings"]))
  const maxLength = Math.max(itemIds.length, itemNames.length, ratings.length)

  return Array.from({ length: maxLength }, (_, index) => ({
    id: itemIds[index] ?? "",
    name: itemNames[index] ?? "",
    rating: ratings[index] ?? ""
  }))
}

export default function SearchStatistics() {
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const thClass = "px-3 py-2 text-left font-semibold align-top whitespace-nowrap"
  const tdClass = "px-3 py-2 align-top whitespace-nowrap"
  const wrapTdClass = "px-3 py-2 align-top whitespace-normal break-words max-w-[320px]"

  const fetchSearchStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("authToken")

      const response = await fetch(
        `https://meemaw.sands.com.ng/api/v1/analytics/search?page=${page}&limit=${pageSize}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()

      const mapped = data.data.map((item, idx) => ({
        sn: (page - 1) * pageSize + idx + 1,
        id: item._id,
        keyword: item.search_key_words,
        categoryText: item.selected_category_text,
        categoryId: item.selected_category_id,
        address: item.search_address,
        longitude: item.search_address_geo?.longitude,
        latitude: item.search_address_geo?.latitude,
        resultCount: item.search_result_count,
        selectedItems: normalizeSelectedItems(item),
        userId: item.user_unique_id,
        timestamp: firstValue(item, ["timestamp", "Timestamp", "timeStamp", "createdAt", "created_at", "createdOn", "date", "Date", "updatedAt", "updated_at"])
      }))

      setRows(mapped)

      if (data.pagination) {
        setTotalPages(data.pagination.total_pages)
        setTotalRecords(data.pagination.total)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSearchStats()
  }, [page, pageSize])

  // SAFE GLOBAL FILTER
  const filtered = rows.filter(r => {
    const items = Array.isArray(r.selectedItems) ? r.selectedItems : []

    const hay = [
      r.sn, r.id, r.keyword, r.categoryText, r.categoryId,
      r.address, r.longitude, r.latitude, r.resultCount,
      r.userId, r.timestamp,
      items.map(si => `${si.id} ${si.name} ${si.rating}`).join(" ")
    ].join(" ").toLowerCase()

    return hay.includes(query.trim().toLowerCase())
  })

  function exportView() {
    const exportRows = filtered.map(r => ({
      S_N: r.sn,
      ID: r.id,
      Keyword: r.keyword,
      CategoryText: r.categoryText,
      CategoryID: r.categoryId,
      Address: r.address,
      Longitude: r.longitude,
      Latitude: r.latitude,
      ResultCount: r.resultCount,
      UserID: r.userId,
      Timestamp: readableTimestamp(r.timestamp),
      ItemIDs: r.selectedItems.map(si => si.id).join(", "),
      ItemNames: r.selectedItems.map(si => si.name).join(", "),
      ItemRatings: r.selectedItems.map(si => si.rating).join(", ")
    }))
    downloadCSV("search-statistics.csv", exportRows)
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold  mb-2">Search Statistics</h2>

      <input
        type="text"
        placeholder="Search all fields..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="border rounded px-3 py-2 mb-4 w-1/2"
      />

      <button
        onClick={exportView}
        className="bg-green-600 text-white px-3 py-2 rounded mb-4"
      >
        Export to CSV
      </button>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="w-full overflow-auto">
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full min-w-max border border-gray-200 text-sm table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className={thClass}>S/N</th>
                <th className={thClass}>ID</th>
                <th className={thClass}>Keyword</th>
                <th className={thClass}>Category Text</th>
                <th className={thClass}>Category ID</th>
                <th className={thClass}>Address</th>
                <th className={thClass}>Longitude</th>
                <th className={thClass}>Latitude</th>
                <th className={thClass}>Result</th>
                <th className={thClass}>User ID</th>
                <th className={thClass}>Timestamp</th>
                <th className={thClass}>Search Id</th>
                <th className={thClass}>Customer's Name</th>
                <th className={thClass}>Rating</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="14" className="px-3 py-4 text-center text-gray-500">
                    No results found.
                  </td>
                </tr>
              )}

              {filtered.map(row => {
                const items = Array.isArray(row.selectedItems) ? row.selectedItems : []

                return (
                  <tr key={row.sn} className="border-t border-gray-200">
                    <td className={tdClass}>{row.sn}</td>
                    <td className={tdClass}>{row.id}</td>
                    <td className={wrapTdClass}>{row.keyword}</td>
                    <td className={wrapTdClass}>{row.categoryText}</td>
                    <td className={tdClass}>{row.categoryId}</td>
                    <td className={wrapTdClass}>{row.address}</td>
                    <td className={tdClass}>{row.longitude}</td>
                    <td className={tdClass}>{row.latitude}</td>
                    <td className={tdClass}>{row.resultCount}</td>
                    <td className={tdClass}>{row.userId}</td>
                    <td className={tdClass}>{readableTimestamp(row.timestamp)}</td>
                    <td className={wrapTdClass}>{items.map(si => si.id).join(", ")}</td>
                    <td className={wrapTdClass}>{items.map(si => si.name).join(", ")}</td>
                    <td className={tdClass}>{items.map(si => si.rating).join(", ")}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded border bg-white disabled:opacity-50"
          >
            Previous
          </button>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 rounded border bg-white disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <span>
          Page {page} of {totalPages} (Total records: {totalRecords})
        </span>

        <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value))
            setPage(1)
          }}
          className="border rounded px-3 py-2"
        >
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>
    </div>
  )
}
