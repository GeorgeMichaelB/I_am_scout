import { Ziggy } from './ziggy';

export function route(name, params = {}, absolute = false) {
    if (!name) {
        return {
            current: (checkName) => {
                if (typeof window === 'undefined') return false;
                const path = window.location.pathname.replace(/^\/|\/$/g, '');
                if (!checkName) return path;
                const routeObj = Ziggy.routes[checkName];
                if (!routeObj) return false;
                const routeUri = routeObj.uri.replace(/^\/|\/$/g, '');
                return path === routeUri;
            },
        };
    }

    const routeDef = Ziggy.routes[name];
    if (!routeDef) {
        console.warn(`Route "${name}" not found in Ziggy routes`);
        return '/' + name.replace(/\./g, '/');
    }

    let uri = routeDef.uri;

    // Handle params
    if (params !== undefined && params !== null) {
        if (typeof params === 'string' || typeof params === 'number') {
            uri = uri.replace(/\{[a-zA-Z0-9_]+\}/, params);
        } else if (typeof params === 'object') {
            const queryParams = new URLSearchParams();
            for (const [key, val] of Object.entries(params)) {
                if (val === undefined || val === null) continue;
                if (uri.includes(`{${key}}`)) {
                    uri = uri.replace(`{${key}}`, encodeURIComponent(val));
                } else {
                    queryParams.append(key, val);
                }
            }
            const queryString = queryParams.toString();
            if (queryString) {
                uri += (uri.includes('?') ? '&' : '?') + queryString;
            }
        }
    }

    if (!uri.startsWith('/')) {
        uri = '/' + uri;
    }

    return uri;
}

if (typeof window !== 'undefined') {
    window.route = route;
}
