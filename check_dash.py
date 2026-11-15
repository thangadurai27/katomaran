import urllib.request

base = 'https://katomaran-eight.vercel.app'
for p in ['/assets/DashboardOverview-DPem7PuP.js', '/assets/DashboardOverview-DaU9DqFZ.js']:
    try:
        r = urllib.request.urlopen(base + p)
        body = r.read().decode('utf8', 'replace')
        print(p, len(body))
        print('WELCOME BACK PRESENT:', 'Welcome back' in body)
        print('NO DATA GUARD:', 'No links yet' in body)
        print('ERROR BANNER:', "couldn't be loaded" in body)
        open('/tmp/' + p.split('/')[-1], 'w').write(body)
    except Exception as e:
        print(p, 'ERR', repr(e))
