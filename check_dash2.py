import urllib.request

base = 'https://katomaran-eight.vercel.app'
r = urllib.request.urlopen(base + '/assets/DashboardOverview-DPem7PuP.js')
body = r.read().decode('utf8', 'replace')
checks = {
    'Welcome back': 'Welcome back',
    'No links yet': 'No links yet',
    'error banner': 'dashboard data couldn',
    'temporarily unavailable': 'Analytics temporarily unavailable',
    'Create Link': 'Create Link',
    'Total Links': 'Total Links',
    'Unique Clicks': 'Unique Clicks',
}
for k, v in checks.items():
    print(k, ':', v in body)
open('/tmp/DashboardOverview_deployed.js', 'w', encoding='utf8').write(body)
print(len(body))
