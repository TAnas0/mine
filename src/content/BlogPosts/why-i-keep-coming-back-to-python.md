---
title: "Why I Keep Coming Back to Python"
date: "2025-03-21"
tags: ["python"]
excerpt: "We all have our go-to truted tools. The ones that just work. For me, it's Python."
---

I’ve spent the better part of my career as a nomad of the tech stack. My Linux installation has become a graveyard of ecosystem dependencies, virtual environment managers, bloated Docker images, half-finished prototypes, and quick sandboxes built to play with shiny new tools without breaking anything. I have chased the holy grail of type safety and performance with Rust, dove into the asynchronous depths of Node.js, and dipped into the pragmatic, structured world of Go. Yet, whenever the dust settles and I need to build something that truly lasts, I inevitably find myself coming back to Python.

If we were to reflect on this, I keep coming back to the same core questions. These aren’t deep philosophical debates. They’re straightforward, practical questions that reveal where your real trust lies as a builder:
- Versatility: If you could only use one programming language for the rest of your life, what would it be? If you had to pick a language before knowing a project's requirements, which language would you choose?
- Practicality, learning curve and business demand: If you were mentoring a complete beginner committed to transition into a software engineering career, which language would you recommend as their foundation?

My answer to all these questions remains the same: **Python**.

Why is that? Habit? Ease? Hype and brainwashing? Or are there tangible advantages to Python?

Comfort maybe? It’s important to challenge that, to put it into words and share it for feedback.
And that’s exactly what this reflection is: a moment to pause and ask myself "Why do I keep coming back to Python?"

## 1. Python is simple

> Any fool can write code that a computer can understand. Good software developers write code that humans can understand (*Martin Fowler*)

**If I had to make a single argument for Python: its simplicity.**
Regardless of the context — the project's scope, the journey that led you to this decision, or the path ahead — simplicity remains an indispensable quality in any language or tool. Overlooking simplicity or opting for complex solutions often leads to **costly consequences, in time, money, security, and developer satisfaction.**

Designing and implementing substantial projects is already complex enough on its own. A lot of effort should go into preventing this complexity from spiraling out of control, and turning a sweet project into a **nightmarish maze**. This balance is maintained at many levels: from data models, directory structures, to reusing solutions, documenting code and solid testing. So what about one of the most foundational choices of development: programming language selection?

Picking a complex language seeps its own complexity across all layers of the project:
- **Database:** you will need an equally complex ORM or intricate type mappings, making data modeling, migrations and optimizations harder to manage.
- **Documentation:** The more complex the code, the more it demands detailed comments, technical documentation and careful justification of design decisions.
- **Security:** Complexity breeds bugs, and bugs breed vulnerabilities. The more layers and intricate mechanisms you introduce, the harder it is to reason about code paths and edge cases, increasing the likelihood of security issues.
- **Developer experience:** Complexity slows development, complicates debugging (especially when issues arise from hidden abstractions or intricate mechanisms), and can create friction between team members with varying experience levels or conflicting design philosophies.

Arguably, the most important point is the last one: developer experience. The mental overhead of working with a complex language distracts from solving problems and implementing business requirements. This is what separates a tool that gets in the way from one that becomes an extension of your mind. Python's simplicity isn't just about immediate ease of use — it's also about long-term readability and maintainability. There's something delightful about reading code smoothly, rather than having to decipher it.


To illustrate Python’s simplicity, here’s an uncommented code snippet that even a complete beginner can read and grasp without struggle:

```python
def calculate_total_price(cart_items, tax_rate):
    total_price = 0
    
    for item in cart_items:
        total_price += item['price']
    
    total_price_with_tax = total_price * (1 + tax_rate)
    
    return total_price_with_tax

shopping_cart = [
    {'name': 'Laptop', 'price': 999.99},
    {'name': 'Headphones', 'price': 199.99},
    {'name': 'Keyboard', 'price': 49.99}
]

tax_rate = 0.10

total = calculate_total_price(shopping_cart, tax_rate)
print(f"The total price with tax is: ${total:.2f}")
```

The `calculate_total_price` could be written succintly using [list comprehension]() without loosing readability:
```python
def calculate_total_price(cart_items, tax_rate):
    return sum(item['price'] for item in cart_items) * (1 + tax_rate)
```


## 2. Breadth of Ecosystem

Python is great for developers who love to experiment, expand their knowledge, and explore new fields. It’s ideal for curious developers navigating career progression and transitions, as well as nimble startups. This broad appeal and adaptability didn’t happen by accident!
A key factor in Python's expansive ecosystem is its widespread adoption in academia and education. The language's readability, low barrier to entry, and efficient packaging of modules made it an attractive choice for educators and students alike. This adoption established Python as a strong foundation in fields like mathematics, scientific research, data analysis, and simulation. Over time, this has fostered a generation of scientists, mathematicians, and researchers who are deeply familiar with Python, propelling its growth and integration into a wide range of industries:
- **Scientific computing**: Python's rich libraries such as NumPy, Pandas, SciPy, and Jupyter have cemented its place in scientific research, enabling advanced data manipulation, analysis, and visualization.
- **Web development**: With frameworks like FastAPI, Django, and Flask, Python has become a go-to language for building scalable, efficient, and maintainable web applications. [This is in a sense the core, or engine driving Python]
- **DevOps & automation**: Ansible, Fabric, and a rich ecosystem of CLI tooling.
- **Data pipelines & orchestration**: Libraries like Airflow, Prefect, and Luigi are ...
- **Data science**: []
- **Machine learning & AI**: Python’s dominance in the AI space is undeniable with libraries like scikit-learn, TensorFlow, and PyTorch driving innovation and development in machine learning. [Worth expanding more]

In addition to these well-established areas, Python is also an excellent springboard into other specialized domains. Although it may not be the best choice for production, unbeatable for prototyping, learning, and building proof-of-concept solutions quickly:

- **Embedded systems and IoT**: MicroPython, CircuitPython — excellent for prototyping on microcontrollers, but these environments are constrained by extremely limited RAM (often in kilobytes), CPU power, and storage which makes C/C++ and assembly more suitable.
- **Networking and security**: Scapy, Nornir, Paramiko — ideal for rapid testing and automation, but high-performance network tooling may require lower-level languages. However, when it comes to high-throughput packet processing, ultra-low-latency systems, or kernel-level networking tools, lower-level languages like C or Rust, or system-oriented languages like Go, are often chosen for their performance, concurrency models, and fine-grained control over system resources.
- **Game development**: Pygame, Panda3D — great for learning game loops and prototyping mechanics, but production 3D engines are dominated by C++ and specialized engines. While Python may not power the main rendering engine of AAA games, it’s often used behind the scenes for scripting, level generation and tooling. 
- **Systems development and scripting**: with libraries like `os`, `subprocess`, `pathlib`, `shutil`, `psutil`.These make it easy to whip up custom CLI utilities or workflow automations. However, when building critical system components (kernel modules, device drivers, etc.) compiled languages like C and Rust take over for speed, memory efficiency, and tight OS integration.


In short, Python doesn’t limit you — it opens doors to nearly every domain of software engineering, offering versatility and an expansive ecosystem that continues to evolve. Want to see what’s hot right now? A great place to start is [Python's most trending projects](https://github.com/trending/python?since=monthly) on Github.

Much of this vibrant growth is made possible by another strength: Python’s cross-platform support and ability to interoperate seamlessly with other languages and systems.

## 3. Cross-platform support and language interoperability

One of Python’s underrated strengths is its remarkable **interoperability** with other languages. While Python itself runs on virtually every major platform (Windows, Linux, macOS, and more), it also allows developers to seamlessly integrate code written in other languages. This means you can leverage Python's simplicity and flexibility while tapping into the performance or ecosystem of other languages.

Here are some concrete ways Python interoperates with other languages:
- **Python ↔ C**:  
  - Using **[`ctypes`](https://docs.python.org/3/library/ctypes.html)** or **[`cffi`](https://cffi.readthedocs.io/)**, Python can directly interface with C libraries.  
  - **Example**:  
    - The core of **`numpy`** is written in C for fast array operations, but the Python interface makes it intuitive to use.  
    - **`scipy`** also wraps many optimized C and Fortran routines.  

- **Python as a wrapper for C++ projects**:  
  - Many large frameworks use Python as the front-facing API for C++ engines.  
  - **Examples**:  
    - **[TensorFlow](https://www.tensorflow.org/)** — a C++ core, exposed through a Python API.  
    - **[PyTorch](https://pytorch.org/)** — C++ backend, Python interface for deep learning workflows.  
    - **[OpenCV-Python](https://pypi.org/project/opencv-python/)** — Python bindings for the well-known C++ computer vision library.  

- **Python ↔ Rust**:  
  - With **[PyO3](https://pyo3.rs/)** and **[`maturin`](https://github.com/PyO3/maturin)**, you can write Rust code, compile it to a shared library, and use it as a native Python extension.  
  - **Examples**:  
    - **`polars`**, a fast DataFrame library, uses Rust for performance-critical parts and exposes a Python API.  
    - Developers building custom Rust algorithms for CPU-bound tasks often expose them through Python for easy integration.  

- **Python ↔ JVM**:  
  - **[Jython](https://www.jython.org/)** allows Python code to run on the JVM, providing access to Java libraries.  
  - **Example use case**:  
    - In enterprise environments where Java ecosystems are dominant, Python developers can still script and automate using Python’s syntax while leveraging robust Java libraries.  

- **Python ↔ .NET**:  
  - **[Python for .NET (pythonnet)](https://pythonnet.github.io/)** allows interoperability with .NET applications.  
  - **Example**:  
    - Python scripts can utilize .NET assemblies, making it easy to integrate with Windows-based enterprise software.  

- **Python embedding in C/C++ applications**:  
  - Instead of just calling C code from Python, you can embed the Python interpreter inside a C/C++ program.  
  - **Example**:  
    - Game engines or scientific applications sometimes use Python as a scripting layer for end-users or plugin developers (e.g., **Blender** embeds Python for scripting complex 3D modeling tasks).  

All these bridges reinforce Python’s position as both a flexible scripting language and a powerful orchestrator across ecosystems.

Maybe no better demonstration of Python's C interoperability is the Python project itself [python/CPython](https://github.com/python/cpython), with over 35% of its codebase written in C. Within Python, many standard library components are implemented in C for performance reasons — not just as wrappers but as part of Python’s fundamental behavior:
- `collections` (deque, defaultdict, Counter have C implementations)
- `json` parser (done in C for speed),
- http-parser, used by Python’s aiohttp or other libraries, are written in C and are all about speed in request/response parsing

These C implementations ensure that Python’s familiar, high-level APIs deliver performance that rivals lower-level solutions where it matters most.

This interoperability transforms Python from just a scripting language into a powerful glue language — a high-level control layer for low-level power that bridges ecosystems and seamlessly integrates into complex, polyglot systems.

Instead of reinventing performance-critical wheels in Python, most major libraries expose elegant, Pythonic APIs over robust engines written in C, C++, or Rust.

**Strategically, Python’s interoperability is one of its greatest strengths. Instead of competing head-to-head with other languages and ecosystems, Python embraces them as part of its own ecosystem.**

As Rust gains traction for its memory safety and performance, we see alternatives like `orjson`, a JSON serializer/deserializer written in Rust, which aims to outperform Python’s built-in `json` module. Similarly, [polars](https://github.com/pola-rs/polars), an alternative to Pandas, is 35% Python, with the remainder built on Rust, enabling it to handle larger-than-RAM data through streaming. Without a doubt, Rust’s speed and memory management capabilities are key to Polars' impressive performance.

This characteristic of Python ensures its adaptability and survivability. As Charles Darwin famously said,
> “It is not the strongest of the species that survive, nor the most intelligent, but the one most responsive to change.


## 4. The Standard Library is a Treasure Chest

The standard library of any programming language is crucial, as it’s developed and maintained by the language’s creators, making it the definitive reference for foundational tools. For beginners, it serves as a streamlined space to learn and grow without the distractions of external dependencies or complex choices. For professionals, it represents an elegant, minimalist set of tools to master — providing everything you need while avoiding unnecessary complexity.

When it comes to Python, the standard library is packed with reliable, battle-tested tools, offering developers everything they need to build robust applications right out of the box. While a standard library isn’t designed to cover every specialized need, it provides the essential building blocks — the nuts, bolts, and nails — that hold everything together.


Python’s standard library is like a well-stocked kitchen: it provides all the essential ingredients and tools you need to prepare almost any dish. For developers, this means a set of reliable, battle-tested components that form the foundation of robust applications. A skilled developer, like a seasoned chef, can create complex, production-grade solutions using only the standard library, while beginners can focus on building strong fundamentals without getting lost in third-party dependencies. The beauty of this kitchen lies in its balance — it offers everything you need to get started, and when the time comes for something more specialized, the rich ecosystem of third-party libraries is there to complement what’s already on hand.


Python’s standard library is packed with reliable building blocks that empower developers to create robust applications without needing third-party dependencies:
- Data serialization (`json`, `csv`): Easily convert data between formats, whether you're working with JSON for web APIs or CSV for data exchange with spreadsheets.
- HTTP client (`urllib`): Efficiently handle HTTP requests and responses, enabling you to build web scrapers, REST clients, or basic HTTP services.
- Async programming (`asyncio`): Leverage asynchronous capabilities to handle I/O-bound tasks concurrently, improving the efficiency of your applications without complex thread management.
- Unit testing (`unittest`): Write and run automated tests with a built-in framework that supports test discovery, assertions, and test execution, ensuring code reliability and maintainability.

You can build serious, production-grade tools without touching third-party packages. What’s missing? Maybe an ORM, scientific computing, cryptography library — but that’s intentional — these tools either rely on external systems or are better handled by sepcialists.

This approach ensures that the standard library remains lightweight and efficient, providing just the right components to get you started. In this sense, Python’s standard library truly functions like a Swiss army knife: versatile, well-rounded, and capable of handling most development needs without requiring external dependencies.

Before reaching for any third-party packages, here’s what you can already accomplish with the tools Python hands you from day one:
1. **Command-Line Tools:** easily manage arguments (`argparse`), manipulate files (`os`, `pathlib`, `shutil`), and process text (`re`, `string`, `textwrap`).
2. **A Basic HTTP Server or REST API:** serve files (`http.server`), build socket-based servers (`socket`, `socketserver`), handle HTTP requests (`urllib`), and serialize JSON data (`json`).
3. **A Web Scraper:** fetch data via HTTP requests (`urllib.request`, `http.client`), parse HTML (`html.parser`), extract data using regex (`re`), and work with various data formats (`csv`, `json`).
4. **Task Scheduling & Automation:** schedule tasks (`sched`, `time`), run Shell commands (`subprocess`), and manage files (`os`, `shutil`).
5. **A Simple Networked Chat:** establish TCP/UDP communication (`socket`) and handle concurrency (`threading`).

Python’s standard library has you covered for nearly everything. The [The Batteries Included Philosophy 🔋🔋](https://peps.python.org/pep-0206/#batteries-included-philosophy) is real.


## 5. Community

When we talk about *community* of a language, we’re talking about maintainers, contributors, users, and the learning ecosystem that surrounds them. It’s not just about writing code — it’s about sharing knowledge, improving tools, and helping each other grow. A healthy community makes it easy to get help, find resources, and feel welcome no matter your level. In Python’s case, the community is thriving, well-organized, and continues to steer the language forward.

All of this traces back to how Python's community was carefully nurtured. Early on, the core maintainers prioritized openness, transparency, and collaboration. The open governance model and the [PEP process](https://peps.python.org/pep-0001/) gave everyone, from hobbyists to large companies, a voice in how the language evolves. This structure encouraged thoughtful design, long-term stability, and continuous improvement. As a result, the community feels both inclusive and purpose-driven.

Practically speaking, learning resources are everywhere, at every level:
- The official documentation is famously readable and beginner-friendly.
- There are countless books, from introductory material to advanced design patterns.
- Thousands of free tutorials, video courses, and blog posts are just a search away.
- Interactive platforms like Real Python, Python Morsels, and communities like Python Discord make learning hands-on and collaborative.

Then there are the conferences and meetups: PyCon and countless local events around the world. These gatherings — whether in-person or virtual — are more than just talks. They’re spaces where new ideas emerge, best practices are shared, and the many faces of Python use-cases come together. Check out [PyCon US](https://us.pycon.org/2025/), [EuroPython](https://ep2025.europython.eu/), or [PyCon Africa](https://africa.pycon.org/2024/) — their YouTube channels are treasure troves of talks, tutorials, and panel discussions.

These events not only drive innovation but also provide a window into how Python is evolving and how diverse its applications have become.

It’s also worth noting that while Python enjoys massive corporate adoption (from Google and Microsoft to smaller startups), it remains community-owned. No single company controls its direction. Instead, the Python Software Foundation, supported by both volunteers and sponsors, ensures stability, sustainability, and a clear vision for the language’s future.

## 6. Python's Flaws and When not *to Python*

> "There are no solutions. There are only trade-offs. (Thomas Sowell)

No tool is perfect. Python’s strengths come with trade-offs, and being aware of its flaws helps you make smarter decisions about when — and when not — to use it.

- Speed and performance: Python is interpreted, dynamically typed, and garbage-collected — all great for developer speed but costly for runtime performance. It can be 10 to 100 times slower than C or Go for compute-heavy workloads. If you’re building something where microseconds matter — like high-frequency trading, real-time game engines, or complex simulations — Python likely won’t cut it.
- Memory management: large-scale, memory-intensive applications can also reveal Python’s weaknesses. Handling enormous datasets in-memory or performing massive concurrent tasks will often lead to performance bottlenecks and heavy memory overhead.
- Dynamic typings: While Python’s dynamic typing is one of its charms, it can become a burden in very large, long-lived codebases. Even with type hints and tools like mypy, many libraries lack complete type annotations, and strict type safety is not enforced at runtime. Over time, this can lead to fragility and slowdowns in large teams or projects that need ironclad maintainability.

So when not to Python? The obvious cases:
- Frontend development (use JavaScript/TypeScript)
- Native mobile apps (Swift, Kotlin)
- System-level programming or embedded systems (C, Rust)

If you’re using Python for these, chances are you’re making life harder than it needs to be.

## 7. Conclusion (and Why I’ll Always Keep Coming Back)

Python is my dear power drill.
It’s not always the flashiest tool in the shed, but it’s the one I reach for when I need to get real work done.
Fast to write, reliable in production, and endlessly adaptable. Whenever I wander off chasing performance or novelty, I eventually find myself coming back — because when the job matters, Python delivers.

To sum it up, Python is:
- Simple enough for beginners, powerful enough for experts.
- Versatile across domains — from web apps to data science to automation.
- Friendly with other tools and languages, never forcing you into a corner.
- Supported by a standard library that feels like a well-stocked toolbox.

And that’s why, after all these years, Python remains my default.

### Resources and References

- [PEP 8 – Style Guide for Python Code](https://peps.python.org/pep-0008/)
- [PEP 20 – The Zen of Python](https://peps.python.org/pep-0020/)
- [Fluent Python](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/) by Luciano Ramalho
- [Clean Code in Python](https://www.oreilly.com/library/view/clean-code-in/9781788835831/) by Mariano Anaya
