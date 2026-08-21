const API_BASE = '/api';

interface RequestOptions {
    method?: string;
    body?: any;
    isMultipart?: boolean;
}

async function request(url: string, options: RequestOptions = {}) {
    const method = options.method || 'GET';
    const token = localStorage.getItem('histeria_admin_token');

    const headers: Record<string, string> = {};
    if (!options.isMultipart) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions: RequestInit = {
        method,
        headers,
    };

    if (options.body) {
        if (options.isMultipart) {
            fetchOptions.body = options.body;
        } else {
            fetchOptions.body = JSON.stringify(options.body);
        }
    }

    const response = await fetch(`${API_BASE}${url}`, fetchOptions);

    if (response.status === 401) {
        const hadToken = !!localStorage.getItem('histeria_admin_token');
        if (hadToken) {
            localStorage.removeItem('histeria_admin_token');
            localStorage.removeItem('histeria_admin_username');
            if (window.location.pathname.startsWith('/admin')) {
                window.location.href = '/admin-login?expired=true';
            }
        }
    }

    // Safe JSON parse — avoid "Unexpected token" if server returns HTML error page
    const contentType = response.headers.get('content-type') || '';
    let result: any;
    if (contentType.includes('application/json')) {
        result = await response.json();
    } else {
        const text = await response.text();
        result = { success: false, message: text || `HTTP ${response.status}` };
    }

    if (!response.ok) {
        throw new Error(result.message || 'API request failed');
    }
    return result;
}

export const api = {
    auth: {
        login: (body: any) => request('/auth/login', { method: 'POST', body }),
    },

    categories: {
        listPublic: () => request('/categories?limit=100'),
        getPublic: (id: string) => request(`/categories/${id}`),
        listAdmin: (page = 1, limit = 20) => request(`/admin/categories?page=${page}&limit=${limit}`),
        getAdmin: (id: string) => request(`/admin/categories/${id}`),
        create: (body: any) => request('/admin/categories', { method: 'POST', body }),
        update: (id: string, body: any) => request(`/admin/categories/${id}`, { method: 'PUT', body }),
        delete: (id: string) => request(`/admin/categories/${id}`, { method: 'DELETE' }),
    },

    products: {
        listPublic: (page = 1, limit = 20, search?: string, category?: string, brand?: string) => {
            const params = new URLSearchParams({ page: String(page), limit: String(limit) });
            if (search) params.set('search', search);
            if (category) params.set('category', category);
            if (brand) params.set('brand', brand);
            return request(`/products?${params.toString()}`);
        },
        getPublic: (id: string) => request(`/products/${id}`),
        listAdmin: (page = 1, limit = 20, search?: string) => {
            const params = new URLSearchParams({ page: String(page), limit: String(limit) });
            if (search) params.set('search', search);
            return request(`/admin/products?${params.toString()}`);
        },
        getAdmin: (id: string) => request(`/admin/products/${id}`),
        create: (body: any) => request('/admin/products', { method: 'POST', body }),
        update: (id: string, body: any) => request(`/admin/products/${id}`, { method: 'PUT', body }),
        delete: (id: string) => request(`/admin/products/${id}`, { method: 'DELETE' }),
    },

    productOptions: {
        listPublic: () => request('/product-options?limit=100'),
        getPublic: (id: string) => request(`/product-options/${id}`),
        listAdmin: (page = 1, limit = 20) => request(`/admin/product-options?page=${page}&limit=${limit}`),
        getAdmin: (id: string) => request(`/admin/product-options/${id}`),
        create: (body: any) => request('/admin/product-options', { method: 'POST', body }),
        update: (id: string, body: any) => request(`/admin/product-options/${id}`, { method: 'PUT', body }),
        delete: (id: string) => request(`/admin/product-options/${id}`, { method: 'DELETE' }),
    },

    productImages: {
        listPublic: () => request('/product-images?limit=100'),
        getPublic: (id: string) => request(`/product-images/${id}`),
        listAdmin: (page = 1, limit = 20) => request(`/admin/product-images?page=${page}&limit=${limit}`),
        getAdmin: (id: string) => request(`/admin/product-images/${id}`),
        create: (body: any) => request('/admin/product-images', { method: 'POST', body }),
        update: (id: string, body: any) => request(`/admin/product-images/${id}`, { method: 'PUT', body }),
        delete: (id: string) => request(`/admin/product-images/${id}`, { method: 'DELETE' }),
    },

    brands: {
        listPublic: () => request('/brands?limit=100'),
        getPublic: (id: string) => request(`/brands/${id}`),
        listAdmin: (page = 1, limit = 20) => request(`/admin/brands?page=${page}&limit=${limit}`),
        getAdmin: (id: string) => request(`/admin/brands/${id}`),
        create: (body: any) => request('/admin/brands', { method: 'POST', body }),
        update: (id: string, body: any) => request(`/admin/brands/${id}`, { method: 'PUT', body }),
        delete: (id: string) => request(`/admin/brands/${id}`, { method: 'DELETE' }),
    },

    sliders: {
        listPublic: () => request('/sliders?limit=100'),
        getPublic: (id: string) => request(`/sliders/${id}`),
        listAdmin: (page = 1, limit = 20) => request(`/admin/sliders?page=${page}&limit=${limit}`),
        getAdmin: (id: string) => request(`/admin/sliders/${id}`),
        create: (body: any) => request('/admin/sliders', { method: 'POST', body }),
        update: (id: string, body: any) => request(`/admin/sliders/${id}`, { method: 'PUT', body }),
        delete: (id: string) => request(`/admin/sliders/${id}`, { method: 'DELETE' }),
    },

    ads: {
        listPublic: () => request('/ads?limit=100'),
        getPublic: (id: string) => request(`/ads/${id}`),
        listAdmin: (page = 1, limit = 20) => request(`/admin/ads?page=${page}&limit=${limit}`),
        getAdmin: (id: string) => request(`/admin/ads/${id}`),
        create: (body: any) => request('/admin/ads', { method: 'POST', body }),
        update: (id: string, body: any) => request(`/admin/ads/${id}`, { method: 'PUT', body }),
        delete: (id: string) => request(`/admin/ads/${id}`, { method: 'DELETE' }),
    },

    coupons: {
        checkCode: (code: string) => request(`/coupons/${code}`),
        listAdmin: (page = 1, limit = 20) => request(`/admin/coupons?page=${page}&limit=${limit}`),
        getAdmin: (id: string) => request(`/admin/coupons/${id}`),
        create: (body: any) => request('/admin/coupons', { method: 'POST', body }),
        update: (id: string, body: any) => request(`/admin/coupons/${id}`, { method: 'PUT', body }),
        delete: (id: string) => request(`/admin/coupons/${id}`, { method: 'DELETE' }),
    },

    uploads: {
        image: (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            return request('/admin/uploads/image', {
                method: 'POST',
                body: formData,
                isMultipart: true,
            });
        },
    },

    ticker: {
        listPublic: () => request('/ticker'),
        listAdmin: (page = 1, limit = 100) => request(`/admin/ticker?page=${page}&limit=${limit}`),
        create: (body: any) => request('/admin/ticker', { method: 'POST', body }),
        update: (id: string, body: any) => request(`/admin/ticker/${id}`, { method: 'PUT', body }),
        delete: (id: string) => request(`/admin/ticker/${id}`, { method: 'DELETE' }),
    },
};
