export interface AnalyticsResponse {
    success: boolean;
    data: SearchAnalytics[];
    pagination: Pagination;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export interface SearchAnalytics {
    _id: string;

    search_key_words: string;

    selected_category_text: string;

    selected_category_id: number;

    search_address: string | null;

    search_address_geo: {
        longitude: number;
        latitude: number;
    };

    search_result_count: number;

    selected_search_item: SelectedSearchItem | null;

    user_unique_id: string;

    timestamp: string;

    createdAt: string;

    updatedAt: string;
}