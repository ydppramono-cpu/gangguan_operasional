import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '../../tools'))
from html_include import expand
html = expand(os.path.join(HERE, '../../src'),'Index')
api = open(os.path.join(HERE, 'api.json')).read()
mock = """<script>
window.__API = %s;
(function(){
  var q = new URLSearchParams(location.search), par = {}; q.forEach(function(v,k){ par[k]=v; });
  function mk(sf, ff){ return new Proxy({}, { get: function(t,k){
    if (k==='withSuccessHandler') return function(f){ return mk(f, ff); };
    if (k==='withFailureHandler') return function(f){ return mk(sf, f); };
    if (k==='withUserObject') return function(){ return mk(sf, ff); };
    return function(){ var r = window.__API[k]; if (r && r.__byArg) r = r[arguments[0]]; window.__calls=(window.__calls||[]).concat([k]);
      setTimeout(function(){ if (r===undefined) { (ff||function(){})(new Error('mock: '+k+' tidak ada')); } else sf && sf(JSON.parse(JSON.stringify(r))); }, 20); };
  }}); }
  window.google = { script: { run: mk(null,null), url: { getLocation: function(cb){ setTimeout(function(){ cb({ parameter: par, parameters: {}, hash: '' }); }, 0); } },
    history: { push: function(){}, replace: function(){}, setChangeHandler: function(){} }, host: { close: function(){}, setHeight: function(){} } } };
})();
</script>""" % api
html = html.replace('<head>', '<head>' + mock, 1)
open(os.path.join(HERE, 'app.html'), 'w').write(html)
