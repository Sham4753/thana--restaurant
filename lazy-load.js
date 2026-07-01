// Lazy Loader - تحميل المحتوى عند الحاجة
var loadedPages = {};

function lazyLoad(page, url) {
    if (loadedPages[page]) {
        document.getElementById('page-' + page).innerHTML = loadedPages[page];
        return;
    }
    
    fetch(url)
        .then(function(r) { return r.text(); })
        .then(function(html) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(html, 'text/html');
            var body = doc.querySelector('body');
            if (body) {
                loadedPages[page] = body.innerHTML;
                var el = document.getElementById('page-' + page);
                if (el) el.innerHTML = body.innerHTML;
            }
        })
        .catch(function() {
            document.getElementById('page-' + page).innerHTML = '<p style="color:#ef4444">❌ فشل التحميل</p>';
        });
}
