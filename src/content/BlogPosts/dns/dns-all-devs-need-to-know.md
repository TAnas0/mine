---
title: "All Developers Need to Know About DNS"
# subtitle: "A practical mental model for resolution, caching, CNAMEs, and DNS debugging"
category: "DevOps & Networking"
status: "Draft (Near Complete)"
target_audience: "Web Developers, Software Engineers, DevOps Beginners"
date: "2026-08-26"
draft: false
tags: ["dns", "devops", "networking"]
excerpt: "More realistically speaking: The DNS concepts developers actually need to understand when building and debugging modern web systems."
---

As a web developer venturing into DevOps, DNS was one of those enigmatic black boxes I supposed would handle itself.
Maybe we take DNS for granted because, frankly, it just works every time. There is no shame in that.
After all, how tough would it be to configure DNS properly? How *much* DNS would I need to deploy my code anyway? It can't be much. And technically, that's true: you can deploy plenty of things without much DNS knowledge. You can get by with quick configurations through polished UIs, following vendor-specific instructions explained as best can be explained.

But what about when things go south? What happens when things go off script?
If you find that too pessimistic for you, then what about performance and speed? Surely name-resolution latency matters, whether we are browsing the internet, or serving our own content. That's when one's mental models are put to the test. That's when knowing the intricate processes involved in DNS, the roles of each component, and the usual suspects becomes valuable.

## 1. Mental Model of DNS

<!-- 
Goals:
- establish why DNS is important for developers
- very brief mention of DNS history, and why it is what it is today
- DNS hierarchy, components
-->

Let's start from the Domain Name System's predecessor: the `HOSTS.TXT` file, the central "address book" of the early Internet (ARPANET). Changes were emailed to SRI's Network Information Center (NIC) and the file was FTP'ed periodically to hosts. And as you might have guessed, this was not scalable at all, mainly due to the centralized system. Worthy to note that not only SRI's servers became overloaded with requests, but also name collisions were becoming a real headache. This meant a radical shift was needed: from a centralized model to a distributed system with many hierarchical delegations, allowing it to scale, and distribute responsibilities.


Before we get into the DNS system, first some necessary terminology:

![DNS Hostname Terminology (Dark Mode)](/images/dns/DNS-hostname-terminology-dark.svg)
![DNS Hostname Terminology (Light Mode)](/images/dns/DNS-hostname-terminology-light.svg)
<div align="center">
  Figure: DNS Hostname Terminology
</div>

<!-- Maybe a note about the special "subdomain" www -->

The hierarchical structure of The DNS system can already be noticed: at the top is the root (`.`), beneath it are the top-level domains such as `.com` and `.net`, and beneath those are domains such as `example.com`. Authority is delegated down this hierarchy, flowing through these 3 main players:
1) Root name servers: foundational authorities at the very top of DNS. provide referrals to the nameservers responsible for TLDs. They do not know anything about `example.net`. All they know are the nameservers respnsible for the TLD `.net`.
2) TLD Servers: manage a specific top-level domain such as `.com`, `.org`, or `.net`. They point to the specific authoritative nameservers for a particular domain delegated under that TLD.
3) Authoritative nameservers: hold the DNS records for their zones and provide authoritative answers for names within those zones. They provide the final answers to domain lookup queries.


Last but not least, there is a pivotal player in the DNS system which sits between clients and these components: DNS recursive resolvers.

The client asks the recursive resolver for an answer. The resolver performs the necessary DNS queries on the client's behalf and caches what it learns. It takes away from the client the complexity of DNS resolution, and optimises at a wider level by caching its answers, allowing subsequent clients to benefit from previous resolutions.

Unlike root, TLD, and authoritative nameservers, the recursive resolver is not a level in the DNS hierarchy. It is the intermediary that performs resolution on behalf of clients. The recursive resolver your machine uses is configurable: it could be provided by your ISP, a public DNS resolver operated by a major tech company (Google, Cloudflare, etc.), or even your own recursive resolver.

The hierarchy and the roles of each component will get clearer once we look at DNS resolution.




## 2. DNS Resolution

With the hierarchy in mind, let's trace exactly what happens when a browser resolves `www.example.com`.

![Recursive DNS Resolution Sequence Diagram (Dark Mode)](/images/dns/DNS-resolution-diagram-dark.png)
![Recursive DNS Resolution Sequence Diagram (Light Mode)](/images/dns/DNS-resolution-diagram-light.png)
<div align="center">
  Figure: Recursive DNS Resolution Sequence Diagram
</div>

For simplicity, let's first assume that no cache is involved anywhere and follow the process of DNS resolution a client goes through:

1) It first speaks to a **recursive resolver** asking for the address of `www.example.com`.
2) The recursive resolver queries a root server asking where too find the `.com` TLD.
3) The root server returns a referral containing `NS` records for the `.com` TLD.
4) The recursive resolver selects one of the TLD servers for `.com` and asks where `example.com` is delegated.
5) The `.com` TLD Server returns another referral, this time containing the NS records for the authoritative nameservers of `example.com`.
6) The recursive resolver asks an authoritative nameserver for `example.com` for the requested record for `www.example.com`.
7) The authoritative server returns the answer. For example, if www.example.com has an A record, the response might contain an IPv4 address such as 192.0.2.10. The response could instead contain a CNAME or another record, depending on how the domain is configured.
8) The recursive resolver returns the DNS answer to the client. The client can then use the resulting address to establish a connection to the destination.




DNS Caching and TTL:
The previous sequence deliberately assumed that none of the required DNS information was cached. In real DNS resolution, caching is fundamental to the system's performance.

Explain TTL of DNS records:
DNS resource records include a TTL (Time To Live) value that specifies in seconds how long a cached record can be treated as fresh.
TTL is therefore a mechanism for controlling the lifetime of cached DNS data
The TTL is not a global expiration timer attached to the record everywhere on the Internet. Different caches may have received the record at different times, so the remaining TTL can differ between resolvers.


Caching can occur at several points:

- Browser cache: browsers can retain DNS information for their own use.
- OS resolver cache: the operating system or local DNS service may cache DNS responses.
- Recursive resolver cache: this is the major shared DNS cache. It is explicitly designed to cache DNS data
- Other DNS infrastructure: depending on the network architecture, additional caching layers can exist. [Great if we can provide interesting cases]

This is important to keep in mind when debugging DNS, as you would be dealing with multiple independent caches.

## 3. DNS Culprits of Developer Pain and Confusion

[Deserves a proper introduction: it's always DNS meme, heads-up to developers, ...]

### 3.1 Caching and TTL

Myth of propagation:
A DNS change becomes visible to clients as their relevant cached records expire.
Different resolvers can de desynchronized: returning different results at the same time.
“Wait 24–48 hours for propagation” is usually an oversimplification


Recommendations for setting TTL values:
- TTL is a tradeoff between stability/performance and changeability
- long ttl: fewer DNS queries, longer caching, slower changes
- Short TTL: more DNS queries, less caching, changes can take effect sooner

Stable records can generally use longer TTLs.
Frequently changing records can use shorter TTLs.

Remember that changing the TTL after a record has been cached does not retroactively shorten the old cached copy's lifetime.



**Tip for Zero-Downtime Migrations:**

Now that we understand TTL-driven propagation of changes in DNS, here is how to properly use it to your advantage during a migration for everything to go smoothly, and cause no downtime:
1. Lower your TTL down to 60 seconds 24 hours before the migration. This ensures old caches expire quickly.
2. Perform your migration and update the DNS record to the new IP.
3. Once the migration is verified and stable, bump your TTL back up to a normal production value (like 3600 or 86400) to optimize performance and reduce query load on your nameservers.


### 3.2 CNAMEs and The Apex Problem

CNAME records: very useful.
What is Apex:
Pitfall for developers is using it on Apex

The apex already needs to contain essential DNS records such as: SOA, NS.
A CNAME cannot coexist with those records. [Why?]
This is very different from `www.example.com`.

This is why you will encounter apparently contradictory instructions from hosting providers:
“Add a CNAME for www.”
“Add an A record for @.”
“Use ALIAS.”
“Use ANAME.”
“Enable CNAME flattening.”
They are solving the same fundamental problem: the DNS apex cannot be an ordinary CNAME.

## 4. Debugging DNS

Diagnostics and debugging methodology


Local resolvers
Dig commands

explain how to compare:

local resolver
      ↓
public recursive resolver
      ↓
authoritative server



## 4. Practical DNS Debugging (on Linux)

When DNS fails, modern applications break in mysterious ways (causing timeouts, connection refused, or resolution errors like `ERR_NAME_NOT_RESOLVED`). Having a structured CLI workflow is essential for diagnosing resolution issues.

### 4.1. Know what your machine is doing

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
  ```

### 4.2 First DNS investigations

- **Lightweight Diagnostics (`host` & `nslookup`)**: For quick checks or lightweight containers where `dig` isn't installed:
  ```bash
  # Simple lookup summary
  host example.com

  # Interactive DNS lookup
  nslookup example.com
  nslookup -type=MX example.com 8.8.8.8
  ```

### 4.3. `dig` (Domain Information Groper): the go-to DNS debugging tool

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

- **Specify which recursive resolver to query**:
  Very useful to test whether a recent DNS update has propagated to public resolvers or your authoritative DNS host specifically, bypassing local system caches:
  ```bash
  dig @1.1.1.1 example.com                # Query Cloudflare (1.1.1.1)
  dig @8.8.8.8 example.com                # Query Google Public DNS (8.8.8.8)
  dig @ns1.dns-provider.com example.com    # Query authoritative server directly
  ```


## Other to add

Mess with DNS
Its github project

Experiments:
- receive an email
- host a website