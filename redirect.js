const requiredUrls = ["*://aliexpress.pl/*", "*://aliexpress.com/*", "*://*.aliexpress.com/*", "*://*.aliexpress.pl/*"];
// Currently it seems to be impossible to redirect store pages :(
const storeRegexp = new RegExp('^http(s)?\:\/\/([a-z0-9]+.)?aliexpress\.pl\/store', 'i');

const domainRegexp = new RegExp('^http(s)?\:\/\/([a-z0-9]+.)?aliexpress\.pl', 'i');
const subdomainRegexp = new RegExp('^http(s)?\:\/\/pl\.aliexpress\.com', 'i');
const pathRegexp = new RegExp('^http(s)?\:\/\/([a-z].)?aliexpress\.com\/pl\//', 'i');

function globalURL(requestDetails) {
    var requestUrl = requestDetails.url;
    if (storeRegexp.test(requestUrl)) {
        return;
    } else if (domainRegexp.test(requestUrl)) {
        let globalSite = requestUrl.replace(/aliexpress\.pl/g, "aliexpress.com");
        return {
            redirectUrl: globalSite
        };
    } else if (subdomainRegexp.test(requestUrl)) {
        let globalSite = requestUrl.replace("pl.aliexpress.com", "www.aliexpress.com");
        return {
            redirectUrl: globalSite
        };
    } else if (pathRegexp.test(requestUrl)) {
        let globalSite = requestUrl.replace("aliexpress.com/pl/", "aliexpress.com/");
        return {
            redirectUrl: globalSite
        };
    }

}

function globalURLReqHeaders(reqDetails) {
    for (let header of reqDetails.requestHeaders) {
        if (header.name === "Cookie") {
            header.value = header.value.replace(/locale\=pl\_PL/g, "locale=en_US").replace(/site\=pol/g, "site=glo");
        }
    }
    return {
        requestHeaders: reqDetails.requestHeaders
    }
}

function globalURLRespHeaders(respDetails) {
    for (let header of respDetails.responseHeaders) {
        if (header.name == "set-cookie") {
            header.value = header.value.replace(/locale\=pl\_PL/g, "locale=en_US").replace(/site\=pol/g, "site=glo");
        }
    }
    return {
        responseHeaders: respDetails.responseHeaders
    }
}

browser.webRequest.onBeforeRequest.addListener(
    globalURL, {
    urls: requiredUrls
}, ["blocking", "requestBody"]);

browser.webRequest.onBeforeSendHeaders.addListener(
    globalURLReqHeaders, {
    urls: requiredUrls
}, ["blocking", "requestHeaders"]);

browser.webRequest.onHeadersReceived.addListener(
    globalURLRespHeaders, {
    urls: requiredUrls
}, ["blocking", "responseHeaders"]);
