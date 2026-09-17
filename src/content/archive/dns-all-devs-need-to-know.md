---
title: "All Developers Need to Know About DNS"
subtitle: "Demystifying resolution, record types, CNAME traps, and security extensions"
category: "DevOps & Networking"
status: "Draft (Near Complete)"
target_audience: "Web Developers, Software Engineers, DevOps Beginners"
date: "2026-08-26"
draft: false
tags: ["dns", "devops", "networking"]
excerpt: "Dive into a pragmatic, developer-oriented exploration of the internet's 'address book' in order to demystify one of the largest distributed systems ever built."
---

When I first ventured into the realm of DevOps, DNS was one of those enigmatic blackboxes that I supposed would seamlessly handle itself. I couldn't have been the only one thinking this way. After all, I said to myself: *"If it works on my localhost, it will surely work on the internet!"*. Oh boy was I wrong! Moving my code from the cozy localhost to the Wild Wild West of the internet made me realize I could not be more mistaken. DNS was definitely behind some of those realizations.

The core purpose of DNS is trivial: it's the **address book of the internet**, translating domain names to IP addresses. But do not let that fool you. In reality, it's a globally distributed database that helps billions of devices locate services, makes the internet usable for humans, and allows for modern infrastructure to evolve without disruption to end users. And because so much depends on it, DNS must be resilient and secure: a small administrative misconfiguration can [cut out a whole cloud region](https://blog.cloudflare.com/cloudflare-outage-on-july-17-2020/); a DNS compromise can [hand all of a bank's 36 domains, including email and FTP servers](https://www.thesslstore.com/blog/ssl-certificates-used-in-major-bank-hack/). Despite being seemingly innocuous, DNS is one of the **largest, fastest, oldest and most resilient** distributed systems ever built.
<!-- Could use links/proof for largest, fastest, oldest... claims -->

Maybe we take DNS for granted because, frankly, it just works every time. There is no shame in that. 
DNS is a rabbit hole worth exploring, but we don't need to drown ourselves in the deep end of network engineering (*necessarily*).
Instead, we will approach DNS from a web developer's perspective: enough theory to understand what's happening and the practical skills to configure, manage, and debug it.

In this guide, we will cover:

1. **Hierarchy**: How Root, TLD, and Authoritative servers are structured and why.
2. **Mechanics of Resolution**: How a recursive resolver navigates that hierarchy to answer a query.
3. **Architectural Tensions**: Performance, consistency, and privacy — the three forces that shape DNS's design.
4. **Caching & TTLs**: How propagation actually works, and how to control it.
5. **DNS Setup**: Acquiring a domain, proving ownership, record types, and the CNAME apex problem.
6. **Practical Linux Diagnostics**: CLI troubleshooting with `resolvectl`, `/etc/hosts`, and `dig`.


## 1. Hierarchy of DNS

DNS is the internet's address book, translating human-readable domain names into IP addresses. It is far harder to remember `142.251.46.174` than `google.com` for us humans, unlike routers and servers, which prefer crunching raw IP bytes. So, someone should provide said translation and maintain it over time, including registration of new domain names, subdomains, IP changes, etc. From 1972 to 1983, that someone was internet hall-of-famer [Elizabeth "Jake" Feinler](https://www.internethalloffame.org/inductees/elizabeth-feinler), and her [team at XYZ managing the late] `HOSTS.txt` file. Changes were emailed to SRI's Network Information Center (NIC) and the file was FTPed periodically to hosts. [This approach, as you might have guessed, is not scalable. The move to... overwhelmed...] before they got overwhelmed after ARPANet's move to TCP/IP.
Looking for a global, scalable and flexible sucessor to `HOSTS.txt` is what gave birth to the decentralized, but **hierarchical**, DNS system we know today.

It all starts at the very top with [Root Servers](https://root-servers.org/). They don't know where `example.com` resides, but they know who handles `.com`: the [called what? Zone?].
[Worth explaining root servers better, mentioning some root server operators].
To put the scale of the Root Servers into perspective, `as of 2026-08-25T12:49:56Z, the root server system consists of 2004 operational instances operated by the 12 independent root server operators.`

> [Root Servers](https://root-servers.org/) being so central to the internet makes it a great place to geek out over global traffic trends. The Root Server System Advisory Committee (RSSAC) hosts an interesting telemetry dashboard with [operational metrics and analytics](https://rssac002.root-servers.org/).

From Root Servers, the system flows downward in a strict hierarchy:
0. Root Servers
1. TLD Servers (.com, .org, etc.): They point to the specific authoritative nameservers for a domain.
2. Authoritative Nameservers: The actual servers (managed by the registrar or DNS host) that hold your domain's records and gives the final answer.
[The TLD server and Nameservers explanation are lacking]

[The hierarchy might be worth a graph, with concrete values .com, .net, etc.]
[
  For www.google.com, for example:

.                    Root
└── com               TLD
    └── google.com    Authoritative zone
        └── www       Record
]

The hierarchy and the roles of each component will get clearer once we look at DNS resolution.

## 2. Mechanics of DNS resolution

With the hierarchy in mind, let's trace exactly what happens when a browser resolves `www.google.com`: when a client makes a DNS request, it is not routed directly to Root Servers. It first speaks to a **recursive resolver** (like your ISP's default resolver, or a public one like Cloudflare's `1.1.1.1` or Google's `8.8.8.8`). The recursive DNS resolver does the heavy lifting, performing multiple iterative queries behind the scenes:
1. **Root Server:** the resolver asks a root server "Who handles the Top-Level Domain `.com`?" The root responses with the addresses of Verisign's TLD nameservers.
2. **TLD server:** the resolver then asks Verisign "Who handles `google.com`?" Verisign responds with the addresses of Google's authoritative nameservers.
3. **Authoritative Nameserver:** the resolver asks Google's nameservers "What is the `A` record for `www.google.com`? This server has the final IP adress response. The recursive resolver caches this response.

![Recursive DNS Resolution Sequence Diagram (Dark Mode)](/images/dns/DNS-resolution-diagram-dark.png)
![Recursive DNS Resolution Sequence Diagram (Light Mode)](/images/dns/DNS-resolution-diagram-light.png)
*Figure 1: Iterative DNS resolution flow from Local Resolver to Authoritative Nameserver.*

[More on recursive resolver: they handle heavy-lifting, they are a provided service, they vary in performance so picking the right one is worth looking into, vector of trust we put into these recursive resolvers]

## 3. The Engineering Trade-offs of DNS

> *"There are no solutions. There are only trade-offs."* Thomas Sowell

DNS has to juggle several competing requirements:
- Performance: How cheaply and quickly can DNS answer queries?
- Freshness: How quickly can changes to DNS data become visible?
- Availability & resilience: Can DNS continue answering despite partial failures?
- Consistency: How much agreement should we expect between different resolvers?
- Privacy: Who can observe the domains being queried?

These requirements are not independent. Caching improves performance but can delay the visibility of changes. Distribution improves resilience but means DNS does not maintain a single globally synchronized view of its data. And because clients typically rely on recursive resolvers, those resolvers occupy an important position in the trust model of DNS.

### 3.1 Performance: Scaling DNS through caching

A modern webpage can cause requests to dozens of hostnames: images, CDNs, fonts, APIs and more. If recursive resolvers had to traverse the DNS hierarchy for every lookup, the requests volume would be huge.

Caching is what makes this practical. Recursive resolvers retain DNS answers for a period of time and reuse them for subsequent queries, avoiding unnecessary trips through the hierarchy.

But caching introduces a new trade-off: the answer being served may no longer reflect the current state of the authoritative data.

### 3.2 Freshness and consistency: Living with stale data

When DNS was designed in the 1980s, the infrastructure it served was considerably less dynamic than today's cloud environments. Records changed infrequently, acquiring a domain was expensive, and most deployments were manual. That sits at a stark contrast with today's modern cloud infrastructure, which is constantly shifting with autoscaling deployments, dynamic load balancers, etc.

DNS caching is excellent for performance, but it means a resolver can continue serving an answer after the authoritative record has changed.

DNS deliberately does not attempt to keep every resolver globally synchronized. An authoritative nameserver provides the current data for its zone, while recursive resolvers independently cache what they learn. For a period of time, two users can therefore receive different answers for the same hostname.
This is not necessarily a failure of DNS. It is an intentional trade-off: the system gives up immediate global consistency in exchange for scalability, performance, and resilience. The same mechanisms that make DNS scalable therefore also help it survive partial failures.

The mechanism that controls this trade-off is the TTL, which determines how long a resolver may retain a cached answer. We will examine exactly how that works in the next section.

### 3.3 Privacy: The resolver as a point of trust

Someone has to receive your DNS query in order to answer it. That resolver now knows you're trying to reach that hostname.
It may see a large portion of the domains a user or organization requests, even though it does not necessarily see the contents of the subsequent HTTPS connections.
Same can be said on anyone snooping on DNS requests. Protocols such as DNS over TLS (DoT) and DNS over HTTPS (DoH) encrypt the connection between the client and resolver, preventing intermediaries from trivially observing those queries. They do not, however, make the queries invisible to the resolver itself.



[Short synthesis tying these together and leading into Part 4]


## 4. DNS resolution Latency, Caching and TTLs
[Here might be a better place to speak about load on DNS network with browser requests and performance demands].

You can easily observe DNS caching in action right from your terminal using `dig` on a new hostname to your device `dig amazon.jp`. [Cant we just add a flag to ignore caches to give a cleaner example. Could use it as an addition and not replacement] Notice the line `;; Query time: 87 msec`. If you repeat the same command, that query time will be dropped to near zero.
[Is there not a more straightforward way of ignoring local cache in a dig command? How does the recursive solver's cache affect the performance?]
[We are using dig command before we reach it in later sections]

You can also see the list of returned DNS records. If you have an eye for detail, and keep executing the command enough, you will notice that each record has a number with it that keeps dropping in time. Every DNS record includes a **TTL (Time to Live)**, measured in seconds. All caching resolvers hold on to that record until its TTL expires. Then it asks for that record again. This is the whole mechanism of "propagation" of changes through the cache layers. [Is this true about TTLs: This is the sole technical implementation governing DNS propagation] The thrown-around adage of *"DNS changes take 24 to 48 hours to propagate globally."* is a myth, a misleading thumb-rule at best.

[What to set my ttl value to? depends on rate of change. some recommended values]

**Pro-Tip for Zero-Downtime Migrations:**
Now that we understand TTL-driven propagation of changes in DNS, here is how to properly use it to your advantage during a migration:
1. Lower your TTL down to 60 seconds 24 hours before the migration. This ensures old caches expire quickly.
2. Perform your migration and update the DNS record to the new IP.
3. Once the migration is verified and stable, bump your TTL back up to a normal production value (like 3600 or 86400) to optimize performance and reduce query load on your nameservers.

## 5. DNS Setup

### 5.1 Acquiring a domain name [and proving it]

Choose a reliable Domain Registrar and purchase a domain name. Your Domain Registrar will register your domain name with the [Internet Corporation for Assigned Names and Numbers](https://www.icann.org/), which is a non-profit in charge of coordinating the use of namespaces and numerical namespaces of the internet.

Some of the most reputable Domain Registrars on the internet today include: [domain.com](https://domain.com), [godaddy.com](https://godaddy.com), [namecheap.com](https://namecheap.com).

> [symbolics.com](https://www.symbolics.com/) became the very first `.com` domain ever registered in 1985.

[**Proving ownership of your domain** comes up more often than you might expect. Certificate authorities (Let's Encrypt, AWS ACM), Google Search Console, and email providers requiring DKIM/DMARC configuration all ask you to prove control of a domain before granting access. The most common method is a **DNS TXT challenge**: the service gives you a token string to add as a `TXT` record at a specific hostname (e.g., `_acme-challenge.example.com`), then queries for it. Once the value is confirmed, ownership is established and the record can be removed — it has no effect on live traffic.]

### 5.2 DNS records and peculiarities to know
[Brief intro of DNS records, the entries of the database, ...]
95% of DNS that developers use belongs to the following types of records:
- `NS` (Name Server): name server records
- `MX`(Mail Exchange): Points domain email traffic to specified mail servers (includes priority rankings).
- `A`: The fundamental building block of DNS. The `A` literally stands for Address, and connects an IP address to a 32-bit IPv4 server address.
- `AAAA`: same as A, but for 128-bit IPv6 addresses.
- `CNAME`: canonical name record, is used instead of an `A` record when setting an alias of a domain, meaning pointing to a (sub)domain and not an IP address. Deployment platforms often provide a CNAME to alias the users domain to their own, e.g. cname.vercel-dns.com. for Vercel or `<custom-name>.<region>.cdn.digitaloceanspaces.com.` for DO spaces. During the DNS resolution chain, when a CNAME is encountered, it's canonical/true name is returned and a second lookup is made on it.

[Below is a great addition/gotcha that is worth a better placement and flow]
CNAME records can be chained together, but affect the performance of DNS resolution. They may also lead to unresolvable loops, when 2 CNAME records point to each other.

Other records:
- `SOA` (Start of Authority): defines global zone parameters
- `TXT` (Text): Stores arbitrary text data. Heavily used for domain verification (SPF, DKIM, DMARC, Let's Encrypt challenges).

#### The Apex Record Problem: Why you can't put a CNAME on `example.com`

According to original DNS specifications (RFC 1034 §3.6.2), a CNAME record cannot coexist with any other record for the exact same hostname. Every domain's root apex (`example.com`) MUST contain `SOA` (Start of Authority) and `NS` (Name Server) records to function. Therefore, placing a standard `CNAME` directly on `example.com` is forbidden because it collides with those mandatory `SOA` and `NS` records.

This historical restriction meant you could point subdomains like `sub.example.com` to deployment platforms (Vercel, DigitalOcean Spaces, Netlify) via a `CNAME`, but not the naked apex domain `example.com`.

==> Modern Solutions: ALIAS / ANAME Records, CNAME Flattening & Linked Records

To bypass the apex restriction and avoid multi-hop lookup delays, modern DNS providers engineered advanced virtual record mechanisms:
- **ALIAS / ANAME Records**: Function like a CNAME at the apex syntactically, but the provider's authoritative nameserver resolves the target hostname to an IP address behind the scenes and returns a standard `A` record directly to the client.
- **CNAME Flattening** (e.g. Cloudflare): Allows you to configure a CNAME at the apex domain in their dashboard while dynamically collapsing ("flattening") the lookup chain into `A`/`AAAA` responses for incoming queries.
- **Linked Records** (e.g. NS1): Provider-level record links that mirror configuration across zones in real-time, eliminating the network latency penalty of traditional multi-hop CNAME alias chains.

## 6. Practical DNS Debugging (on Linux)

When DNS fails, modern applications break in mysterious ways (causing timeouts, connection refused, or resolution errors like `ERR_NAME_NOT_RESOLVED`). Having a structured CLI workflow is essential for diagnosing resolution issues.

### 6.1. Local Resolvers and Lightweight Diagnostics

Before querying external servers, Linux checks local resolution rules defined in `/etc/nsswitch.conf` (typically `hosts: files dns`).

- **`/etc/hosts`**: Overrides DNS resolution locally for development and testing.
  ```bash
  127.0.0.1   dev.local.app
  192.168.1.50 staging.example.com
  ```

- **`/etc/resolv.conf`**: Defines the upstream recursive resolvers used by your system.
  ```bash
  nameserver 127.0.0.53  # Local systemd-resolved stub
  nameserver 1.1.1.1     # Cloudflare Public DNS
  ```

- **`resolvectl` (systemd-resolved)**: On modern Linux distros (Ubuntu, Debian, Fedora), you can inspect DNS configuration, flush local caches, and inspect statistics:
  ```bash
  # Check active DNS servers & per-interface configuration
  resolvectl status

  # Flush local DNS cache
  sudo resolvectl flush-caches

  # Inspect cache statistics
  resolvectl statistics
  Transactions                                      
                         Current Transactions:     1
                           Total Transactions: 12386
                                                    
  Cache                                             
                           Current Cache Size:    17
                                   Cache Hits:  2894
                                 Cache Misses: 12563
                                                    
  Failure Transactions                              
                               Total Timeouts:  1941
           Total Timeouts (Stale Data Served):     0
                      Total Failure Responses:     0
  Total Failure Responses (Stale Data Served):     0
                                                    
  DNSSEC Verdicts                                   
                                       Secure:     0
                                     Insecure:     0
                                        Bogus:     0
                                Indeterminate:     0
  ```

- **Lightweight Diagnostics (`host` & `nslookup`)**: For quick checks or lightweight containers where `dig` isn't installed:
  ```bash
  # Simple lookup summary
  host example.com

  # Interactive DNS lookup
  nslookup example.com
  nslookup -type=MX example.com 8.8.8.8
  ```

### 6.2. Inspecting DNS with `dig` (Domain Information Groper)

`dig` (Domain Information Groper) is the Swiss Army knife for DNS troubleshooting. Let's look at a real query output:

```bash
$ dig google.com

; <<>> DiG 9.18.39-0ubuntu0.24.04.6-Ubuntu <<>> google.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 37196
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 65494
;; QUESTION SECTION:
;google.com.			IN	A

;; ANSWER SECTION:
google.com.		142	IN	A	172.217.171.46

;; Query time: 11 msec
;; SERVER: 127.0.0.53#53(127.0.0.53) (UDP)
;; WHEN: Wed Aug 26 16:49:33 +01 2026
;; MSG SIZE  rcvd: 55
```

Reading this output section by section:
- **HEADER (`status: NOERROR`)**: Confirms the lookup succeeded. Common failure statuses here are `NXDOMAIN` (domain doesn't exist) or `SERVFAIL` (nameserver error).
- **FLAGS (`qr rd ra`)**:
  - `qr` (Query Response): This is an answer to a query.
  - `rd` (Recursion Desired): We requested the resolver to perform recursive lookups.
  - `ra` (Recursion Available): The resolver confirmed it supports recursion.
- **QUESTION SECTION (`google.com. IN A`)**: Shows that we queried an IPv4 `A` record for `google.com` in the Internet (`IN`) class.
- **ANSWER SECTION (`google.com. 142 IN A 172.217.171.46`)**:
  - `142`: The remaining Time-to-Live (TTL) in seconds before this cached entry expires.
  - `172.217.171.46`: The resolved IPv4 target address.
- **SERVER (`127.0.0.53#53`)**: Local `systemd-resolved` stub resolver answered the request on port 53.
- **Query time (`11 msec`)**: Round-trip time to process and return the DNS answer.

Once you're comfortable reading a basic `dig` response, you can tailor your queries with flags to debug specific troubleshooting scenarios:

- **Trace the full resolution path (`+trace`)**:
  When a domain fails to resolve, walk the hierarchy step-by-step from Root servers (`.`) to TLD (`.com`) down to authoritative nameservers to isolate where resolution breaks:
  ```bash
  dig +trace example.com
  ```

- **Query specific record types**:
  By default `dig` queries `A` records. Specify a record type to inspect mail routing (`MX`), verification tokens (`TXT`), aliases (`CNAME`), or nameservers (`NS`):
  ```bash
  dig example.com MX        # Mail Exchange records
  dig example.com TXT       # SPF, DKIM, ownership verification
  dig example.com CNAME     # Canonical Name alias
  dig example.com NS        # Authoritative Name Servers
  ```

- **Bypass local resolver & query nameservers directly (`@server`)**:
  Very useful to test whether a recent DNS update has propagated to public resolvers or your authoritative DNS host specifically, bypassing local system caches:
  ```bash
  dig @1.1.1.1 example.com                # Query Cloudflare (1.1.1.1)
  dig @8.8.8.8 example.com                # Query Google Public DNS (8.8.8.8)
  dig @ns1.dns-provider.com example.com    # Query authoritative server directly
  ```

## Further Readings and References

- DigitalOcean's [An Introduction to DNS Terminology, Components, and Concepts](https://www.digitalocean.com/community/tutorials/an-introduction-to-dns-terminology-components-and-concepts#record-types)
- [RFC 1034](https://www.rfc-editor.org/info/rfc1034/) (Domain Names - Concepts and Facilities) & [RFC 1035](https://www.rfc-editor.org/info/rfc1035/) (Domain Names - Implementation and Specification)
- Cloudflare's [DNSSEC: An Introduction](https://blog.cloudflare.com/dnssec-an-introduction/)




HUGE GOLD nugget: https://messwithdns.net/ and https://github.com/jvns/mess-with-dns


[


  This distinction will pay dividends later when you discuss:

dig @1.1.1.1 example.com
dig @ns1.dns-provider.com example.com

Those two commands are fundamentally different because you're asking different kinds of DNS servers.
]

[
  multiple caches involved

  This distinction will pay dividends later when you discuss:

dig @1.1.1.1 example.com
dig @ns1.dns-provider.com example.com

Those two commands are fundamentally different because you're asking different kinds of DNS servers.
]
