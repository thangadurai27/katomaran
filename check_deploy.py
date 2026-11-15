import urllib.request, json

base = 'https://katomaran-eight.vercel.app'
paths = ['/assets/index-qzsi-hBw.js', '/assets/index-BifsA5co.css', '/registerSW.js', '/manifest.webmanifest', '/sw.js']
for p in paths:
    try:
        r = urllib.request.urlopen(base + p)
        body = r.read()
        print(p, r.status, r.headers.get('Content-Type'), len(body))
    except Exception as e:
        print(p, 'ERR', repr(e))

r = urllib.request.urlopen(base + '/manifest.webmanifest')
print(json.loads(r.read().decode()))
