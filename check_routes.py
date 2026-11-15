import urllib.request, urllib.error

base = 'https://katomaran-eight.vercel.app'
for p in ['/dashboard/overview', '/dashboard', '/login', '/signup', '/nonexistent-page-xyz']:
    try:
        r = urllib.request.urlopen(base + p, timeout=30)
        body = r.read().decode('utf8', 'replace')
        print(p, r.status, r.geturl(), len(body))
        print('   has root div:', '<div id="root">' in body)
        print('   title-ish snippet:', body[300:700].replace('\n', ' ')[:400])
    except urllib.error.HTTPError as e:
        print(p, 'HTTPError', e.code, e.headers.get('Location'))
    except Exception as e:
        print(p, 'ERR', repr(e))
