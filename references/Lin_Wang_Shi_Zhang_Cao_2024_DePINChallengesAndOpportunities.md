# Lin_Wang_Shi_Zhang_Cao_2024_DePINChallengesAndOpportunities.pdf

## Page 1

1
Decentralized Physical Infrastructure Network
(DePIN): Challenges and Opportunities
Zhibin Lin, Taotao Wang, Long Shi, Shengli Zhang and Bin Cao
Abstract—The widespread use of the Internet has posed chal-
lenges to existing centralized physical infrastructure networks. Is-
sues such as data privacy risks, service disruptions, and substan-
tial expansion costs have emerged. To address these challenges,
an innovative network architecture called Decentralized Physical
Infrastructure Network (DePIN) has emerged. DePIN leverages
blockchain technology to decentralize the control and manage-
ment of physical devices, addressing limitations of traditional
infrastructure network. This article provides a comprehensive
exploration of DePIN, presenting its five-layer architecture, key
design principles. Furthermore, it presents a detailed survey of
the extant applications, operating mechanisms, and provides an
in-depth analysis of market data pertaining to DePIN. Finally, it
discusses a wide range of the open challenges faced by DePIN.
Index Terms —Blockchain, Decentralized Physical Infrastruc-
ture Network, Web 3.0, Infrastructure Network.
I. I NTRODUCTION
I
N the context of the digital age, technological advances
and the popularization of the Internet have combined
to drive the development of society. However, this process
also brings challenges to the existing centralized physical
infrastructure networks, which mainly include the risk of data
privacy leakage, the possibility of service disruption, and the
substantial costs of network expansion. To effectively address
these growing issues, an innovative network architecture—
Decentralized Physical Infrastructure Network (DePIN)—has
emerged. DePIN provides a potential solution to the con-
straints of conventional centralized infrastructure networks by
integrating blockchain technology to decentralize the control
and management of physical devices.
DePIN, a combination of Web 3.0 and Intelligence of
Things (IoT), was initially given the name “MachineFi” by
IoTeX, a innovative blend of the concepts of machine and
Decentralized Finance (DeFi) to reflect the potential of ma-
chines and their data for financialization. In July 2022, Lattice
made an effort to redefine the field by suggesting the term
“TIPIN” (Token Incentivized Physical Networks). This term
was proposed to provide a more precise description of the
utilization of token incentives in enabling the joint deployment
and operation of a physical network model. In November 2022,
Z. Lin, T. Wang and S. Zhang are with the College of Electronic and Infor-
mation Engineering, Shenzhen University, China (linaacc9595@gmail.com,
ttwang@szu.edu.cn, zsl@szu.edu.cn). L. Shi is with the School of Electronic
and Optical Engineering, Nanjing University of Science and Technology,
China (slong1007@gmail.com). B. Cao is with the State Key Laboratory
of Networking and Switching Technology, Beijing University of Posts and
Telecommunications, China (caobin@bupt.edu.cn). Corresponding Author:
Bin Cao .
Messari launched a poll 1 via the Twitter platform to select
a term that best represents the field from several candidate
names. In this poll, the name “DePIN” came out on top with
31.6% of the votes and was eventually recognized as the
official nomenclature of the domain. This marks the formal
acknowledgment of DePIN as a definitive term in academic
and industrial discourses concerning decentralized physical
infrastructure networks.
Compared to the traditional infrastructure networks, DePIN
embodies a physical infrastructure network with the following
distinguishing features.
• Collective Ownership: DePIN encourages network par-
ticipants to actively deploy physical devices to infras-
tructure networks through token incentives mechanism,
establishing a bottom-up self-organizing model. This ap-
proach ensures widespread distribution of network own-
ership, preventing it from being monopolized by a few
shareholders or centralized entities.
• Low operating costs : The self-organized model aligns
with market economy principles, where resource man-
agement within the network is based on incentive mech-
anisms that maintain a balance between supply and
demand, effectively preventing resource waste [1]. Ad-
ditionally, network contributors bear the responsibility of
maintaining their equipment, significantly reducing the
overall maintenance costs. Furthermore, the transparent
and democratic governance system further reduces un-
necessary operating expenses caused by corruption in
centralized systems.
• Privacy and Security : The decentralized architecture of
DePIN effectively eliminates the risks of service disrup-
tions, enhancing its overall security. In the event of a
node or component failure, the remaining network com-
ponents can sustain to provide service. Furthermore, by
leveraging blockchain as the underlying technology [2],
the system safeguards personal data against unauthorized
manipulation or access by third parties.
• Openness and Innovation: The inherent decentralization
of DePIN substantially reduces market barriers, enabling
new entrants to challenge industries that have historically
been dominated by a limited number of firms. This
heightened openness fosters a competitive environment,
spurring innovation and driving the development of su-
perior products and services for consumers.
1https://twitter.com/MessariCrypto/status/1588938954807869440?ref=
iotex.io
arXiv:2406.02239v1  [cs.NI]  4 Jun 2024

---

## Page 2

2
Key principles
Security and 
Privacy
Decentralized 
Economy and 
Governance
Scalability and 
Low-latency
Intelligence
Application 
layer
 Sensor Wireless
 Bandwidth Storage Compute AI
Governance 
layer
 DAO NFT DID
Data 
layer
Blockchain 
layer
Access control Storage
On-chain
Cross-chain
Off-chain
semantic search
knowledge inference
semantic communication
Artificial general intelligence
Zero touch network
Smart decision-making
Semantic Artificial Intelligence
Universal blockchains
Layer 1 solution
Layer 2 solution
Layer 3 solution
Infrastructure tool
Node service
Cross chain
Wallet
Specific blockchains
DePIN -Specific chains
Application chains
Overlay network
P2P network topology P2P searching mechanism
Underlay Network
Core network
RAN
CU
DU pool RU
Edge server
T erminals
Infrastructure 
layer
Democracy
User owned
Decentralization
Reality
Feature-rich
Smart Contract DeFi Tokenomics
Permissionless
Long lifecycle
Inclusiveness
Transparency
Security
Privacy
Fig. 1. The architecture of DePIN, including the application layer, the governance layer, the data layer, the blockchain layer, and the infrastructure layer
Therefore, DePIN is considered to have great potential in
reshaping many respects of traditional physical infrastructure
networks. For example, DePIN’s decentralized nature can
enhance the trust and security of 6G mobile networks [3].
By distributing data and computational tasks across multiple
nodes, it reduces the risk of single points of failure and
improves resilience against cyber threats for 6G networks.
Additionally, blockchain technology can be leveraged within
DePIN to provide tamper-proof and transparent data records,
enhancing the security and trustworthiness of 6G networks.
This article provides a comprehensive exploration of DePIN,
presenting its five-layer architecture and key design princi-
ples. Moreover, the article provides an in-depth exploration
of the existing applications and operational mechanisms of
DePIN, and presents market data for DePIN spanning nearly
a year. Finally, it concludes with a discussion of the multiple
challenges faced by DePIN. The remainder of this article
is organized as follows: Section II introduces the DePIN
architecture through its five foundational layers. Section III
elucidates the key design principles guiding the architecture.
Section IV delves into the investigation of the DePIN projects,
encompassing its applications, operational mechanisms, and
market data analysis. Section VI highlights the challenges
facing DePIN. Finally, Section VII concludes the article and
suggests directions for future research.
II. D EPIN ARCHITECTURE
In this section, we provide a comprehensive exposition of
the proposed architecture for DePIN. As Illustrated in Fig.
1, the architecture, based on different functions, is intricately
structured as a five-layer hierarchy, comprising the application
layer, governance layer, data layer, blockchain layer, and
infrastructure layer.
A. Application layer
DePIN’s application layer is meticulously designed to of-
fer a distinct experience compared to Web 2.0 application
services, such as license-free access, long-term lifecycle, and
feature richness. Facilitated by the decentralized governance
layer, application layer achieves permissionlessness, enabling
users to freely access the network. Participants can acquire
services, and deploy applications without the need for review
or approval from any centralized authority. Unlike traditional
Web 2.0 applications that rely on the operations of a single
company, the application layer’s long lifecycle significantly
enhances its reliability [4]. In the Web 2.0 model, appli-
cations’ data and devices are highly centralized, subjecting
them to the control of a single company, which can lead to
service instability and the risk of applications disappearing.
In contrast, DePINs are built upon the governance layer’s
economic incentives and data layer’s data persistence storage
capabilities. Thus, DePIN applications will keep serving users
as long as there are service providers in the network. Moreover,
the application layer exhibits remarkable functional richness,
supporting a diverse array of applications and services, in-
cluding data storage and transmission, resource sharing, and
distributed computing. In Section IV , DePIN applications and
their categorizations will be explored in further detail.
B. Governance layer
The governance layer assumes a critical role in establishing
the operational rules and institutional foundation of DePIN. It
encompasses decision-making mechanisms, transaction rules,
incentive mechanisms, and conflict resolution. the governance
layer adheres rigorously to the principles of decentralization
and privacy protection. By leveraging several core innova-

---

## Page 3

3
tions based on smart contracts, such as Non-Fungible Tokens
(NFTs), Decentralized Identifiers (DIDs), Decentralized Au-
tonomous Organizations (DAOs), and DeFi, the governance
layer constructs a transparent, democratic, and adaptable gov-
ernance system [5]. Supported by the blockchain layer, the
governance layer ensures the transparency and auditability of
all transactions, enabling participants within the network to
observe decision-making processes and resource allocation.
Within the governance framework of DAO [6], users have
equal opportunities to partake in decision-making, effectively
preventing the monopolization of decision-making power by
a privileged few, embodying the essence of democratic gov-
ernance. Moreover, the governance layer demonstrates re-
markable adaptability, promptly responding to environmental
changes and following user needs. This is because of the
decentralized decision-making process and financial system,
which liberates the governance layer from the constraints
imposed by centralized institutions.
C. Data layer
The data layer fulfills a crucial role in managing the com-
plete lifecycle of all data within DePIN, encompassing data
access, storage, and processing. The design of the data layer
is guided by a set of core principles, including security, privacy
protection, intelligence, and high scalability. First, data access
in the data layer involves access authentication and control,
protecting the data privacy and ownership of users, through
advanced encryption and decentralized identity technologies.
Second, the decentralized storage technology, which exploits
number of independent nodes to jointly maintain user data
based on a consensus protocol, exhibits greater robustness
against cyber attacks compared to traditional centralized stor-
age techniques. It can achieve permanent data storage through
a token incentive mechanism. The adoption of decentralized
storage technology within the data layer significantly enhances
data security and long-term preservation. Regarding data pro-
cessing, the data layer leverages Semantic Technology [7]
to establish a comprehensive system encompassing Semantic
Search, Knowledge Inference, and Semantic Communication.
This system aims to deliver more precise and personalized
search results, deeper data insights, and a more natural and
intuitive user interaction experience. Facilitated by semantic
technologies, the data layer empowers intelligent data services,
such as Artificial General Intelligence, Zero-Contact Net-
works, and Smart decision-making. These services automate
DePIN management and operations while providing accurate
and timely decision support. The effective functioning of the
data layer also relies on the support of other layers, such as the
governance layer providing DID services to ensure secure and
reliable user authentication [8], the blockchain layer offering
trust enhancement and decentralized storage for data, and the
infrastructure layer providing physical resource support for
data computation and transmission. This cross-layer synergy
establishes a robust foundation for managing the complete
lifecycle of data within DePIN.
D. Blockchain layer
The blockchain layer within DePIN’s architecture
encompasses blockchain technologies, including general-
purpose blockchain solutions, specific blockchain solutions,
and blockchain infrastructure tools. The general-purpose
blockchain solution encompasses Layer 1 (the base blockchain
layer), Layer 2 (the scalability extension solution), and Layer
3 (the application layer), forming a comprehensive blockchain
technology stack that ensures seamless service from the base
layer to the application layer while addressing scalability
challenges. The specific blockchain solutions within the
blockchain layer include the DePIN-Specific Chain, tailored
specifically to the requirements of DePIN. The IoTeX [9],
leveraging its expertise in IoT domain, provides specialized
blockchain solutions for the unique needs of DePIN. On
the other hand, the Application Chains facilitates the
creation of customized blockchains or subchains within
DePIN ecosystem, enabling efficient operations for specific
services or data. Additionally, a comprehensive set of
blockchain infrastructure tools, such as wallets for managing
crypto assets, cross-chain bridges enabling interoperability
between different blockchains, and node services providing
infrastructural support, form the foundation of blockchain
ecosystem. This collection of tools drives the advancement
of blockchain technology and promotes its applications.
Ultimately, blockchain technology serves as the infrastructural
backbone for the governance layer and data layer, for enabling
decentralized economics and governance while protecting
privacy and security of data in DePINs.
E. Infrastructure layer
The infrastructure layer forms the cornerstone of the entire
architecture, providing the necessary communication, comput-
ing, and storage resources for the upper layers. Therefore, the
infrastructure layer must possess an extremely high degree of
scalability to support the demands of a large-scale DePIN.
It consists of the overlay network and the underlay network,
covering network devices, computing devices, and terminal
devices. Within the overlay network, the peer-to-peer network
[10] utilizes its decentralized topology and search mechanism
to enable efficient communication between nodes without rely-
ing on centralized servers. As the underlying network protocol
of the blockchain, it provides the decentralized fundamental
framework for value transfer and information exchange within
DePIN. The underlying network is further subdivided into the
core network, the radio access network, and the terminals,
which are responsible for the physical transmission of data
packets. Devices in terminal devices are particularly critical
in DePIN, as they play a central role in data collection,
computing, and transmission. Sensors can be deployed in
various environments and collect varied information, including
temperature, humidity, sound, images, video, and more. The
collected data can drive a variety of applications such as
navigation maps, energy networks, wireless networks, smart
cities, and more. Through wireless communication devices
such as WiFi, Bluetooth, etc., DePIN participants can jointly
build a decentralized shared network to provide users with

---

## Page 4

4
diverse network services [11]. Data servers provide a large
amount of computing and storage resources, which form the
hardware foundation of the decentralized data storage system
and bandwidth service system in DePINs. The decentralized
computation acceleration hardware system provides rentable
acceleration hardware (e.g., Graphics Processing Unit, GPU,
Tensor Processing Unit, TPU, etc.) for performing complex
computational tasks such as machine learning and image
processing.
III. KEY DESIGN PRINCIPLES
In this section, we summarize the key principles to consider
when designing the architecture of DePIN.
Intelligence: To build a more accessible, user-friendly, and
efficient DePIN ecosystem, the implementation of intelligent
design principles is of paramount importance. This adherence
to intelligent design principles not only facilitates a conve-
nient and precise service experience for end-users but also
significantly improves the operational efficiency of the entire
network. Within the framework of DePIN, interoperability
emerges as a pivotal component of intelligent design. It allows
seamless communication and interaction between different
platforms, applications, and systems, effectively addressing
the challenges of data source diversity, data heterogeneity,
and consensus protocol compatibility in DePIN ecosystem.
Enhanced interoperability [12] enables users to switch between
different networks or systems without any hassle, ensuring
the consistency and coherence of user identities and assets.
It fosters synergistic relationships among diverse services and
applications, bringing a more abundant and unified experience
to users. This cross-platform and cross-system interoperability
is key to realize large-scale DePIN, which drives DePINs
toward greater technology integration and a broader user base.
Privacy and security : In the context of Web 3.0, security
and privacy [13] are crucial for maintaining the stability of
the network and the rights of users, especially in DePIN.
The concept of security involves mechanisms for defending
against network attacks, hacking, and fraud, to safeguard the
robustness of DePIN systems. Privacy, meanwhile, focuses
on protecting users’ personal information and sensitive data
from unauthorized access and misuse. By implementing high
standards of security and privacy protection measures, DePIN
effectively shields its users from risks such as cyber-attacks,
fraudulent practices, and digital theft, thereby building trust
and reliability in a decentralized cyber environment. Therefore,
to drive widespread adoption of DePIN and active user partic-
ipation, it is important to prioritize and continuously optimize
these protection mechanisms to address evolving cybersecurity
threats and privacy protection needs.
Decentralized economy and governance : Decentralized
economics and governance together underpin a trustless and
democratic network that allows everyone to participate and
benefit equally. The decentralized economy presents an inno-
vative economic model that allows users to complete transac-
tions without a trusted authority. Specifically, DePIN adopts a
decentralized economic model that incentivizes participants in
a permissionless way to share and utilize data or hardware re-
sources, to construct an infrastructure network. Decentralized
governance plays a crucial role in ensuring the democracy
of the network. It avoids the concentration of power in the
hands of a few centralized institutions by enabling all net-
work participants to take part in the decision-making process,
thus promoting the active participation and contribution of
them. Through this decentralized governance structure, DePIN
can achieve broader social participation and more efficient
resource allocation.
Scalability and low-latency : Scalability is a measure of
a system’s ability to process transactions as the network size
grows. In DePIN, the network is filled with computational
results from physical devices and user transactions, which
place extremely high demands on the network’s throughput.
To support data-intensive applications, and achieve global
accessibility, DePIN has to follow a design philosophy that
prioritizes scalability to enable seamless user interaction with
the networks, while preventing performance bottlenecks and
excessive transaction costs. For DePIN, which is built upon nu-
merous physical devices, low-latency communication between
devices in the infrastructure layer is also one of the design
principles. Emphasizing the connection to the physical world,
DePIN applications must ensure the real-time nature of the
data sampled from the physical world. Only by ensuring the
real-time communication of devices can the network provide a
foundation for delivering precise and reliable services to users.
IV. INVESTIGATION OF D EPIN S
In this section, we present a investigation of DePIN, in-
cluding the applications, the operational mechanism, and the
capital market value of DePIN.
A. Applications
As shown in Fig. 2, DePIN applications can be divided into
two main categories:
1) Physical Resource Network: This category of network
promotes the deployment of devices that are closely tied to
a specific geographic location and that provide unique and
irreplaceable services and products based on that location, such
as WiFi coverage, environmental monitoring data, and image
information. In Physical Resource Networks, participants are
rewarded with tokens by contributing valuable data or network
resources to the surrounding environment.
Further, Physical Resource Network can be subdivided into
two major subcategories, Sensor and Wireless.
• Sensor: Sensor networks use sensors to collect environ-
mental data in a variety of areas including Energy, Smart
City, Environmental, Mobility, Location, Health Care,
Mapping, and Smart Home. Energy networks play a key
role in monitoring energy consumption and distribution,
which is important for promoting sustainability and re-
source utilization efficiency; Smart City networks collect
data on all aspects of city life through the deployment of
sensors in urban environments, enabling more efficient
city planning; Environmental networks focus on moni-
toring various aspects of the environment; Mobility net-
works aim to monitor or provide data on the movement of
objects and people, which are critical in applications such

---

## Page 5

5
Elumicate
Healthblock
Wicrypt
Sensor
Physical Resource
Environmental
Energy
WeatherXM
Arkreen Daylight Energy
Location
Planet Watch
Mapping
Smart City
Mobility
Health Care
Smart Home
Smart Point
Drife DIMO
Mindland
Starpower PiPhi
GEODNET Onocoy
NatixHivemapper
Wireless
LoRaWAN
5G
 WIFI
Bluetooth
Helium Mobile Karrier One
Helium IoT Drop Wireless
WiFiMap
Nodle
Sensor
Digital Resource
Virtual Private Network
Mysterium
Presearch Brave 
Content Delivery Network
Orchid 
Web Proxy
Database
File Storage
General Purpose
GPU Marketplace
Space and Time Aleph 
Filecoin Arweave
Render Akash 
Livepeer The Graph
Meson Fleek 
Wynd Web
Machine Learning Models
AI Frameworks
Fetch AI Paal AI
Together Gensyn
Exabits 
ChainML
Bandwidth Browser
 Storage
Compute
Specific Purpose
Artificial Intelligence
GPU.net
Giza
Health Blocks
Elumicate
Wicrypt
Fig. 2. The applications of DePIN can be divided into two main categories:
Physical Resource Networks and Digital Resource Networks. Physical Re-
source Networks and Digital Resource Networks can be further categorized
into different application categories.
as tracking, navigation, and logistics; Location networks
utilize Geographical Location technology to measure the
object device’s precise geographic coordinates; Health
Care networks track and monitor personal health status
through human wearable sensors, providing valuable data
for health management; The Mapping networks focus
on capturing geographic and topographic data to create
maps and spatial models to support spatial analysis;
The Smart Home network enables remote management
and intelligent control among smart home devices by
connecting physical devices to the blockchain network.
• Wireless: Wireless networks establish a decentralized
network of hotspots through wireless networking hard-
ware devices, including but not limited to 5G, WiFi, Long
Range Wide Area Network (LoRaW AN), and Bluetooth.
Decentralized 5G network architectures play a crucial
role in delivering high-speed, low-latency data trans-
mission services; WiFi networks provide local wireless
connectivity and are typically used in public places to
provide Internet access within a specific area; LoRaW AN
has long range and low power communication character-
istics and can provide communication services for IoT
networks that require extended battery life and wide
range coverage; Bluetooth networks can provide low-
range wireless network services to IoT devices and are
suitable for short-range communication between wireless
devices.
2) Digital Resource Networks: This category of network
encourages users to share their digital resources, including but
not limited to bandwidth, storage space, and computing power.
These Digital Resource Networks demonstrate significant
competitive advantages over traditional centralized service
providers in terms of cost-effectiveness and user accessibility.
Digital Resource Networks are categorized into bandwidth,
storage, compute, and AI networks.
• Bandwidth: Bandwidth networks can build decentralized
media content distribution networks, including Browser,
Virtual Private Network (VPN), Content Delivery Net-
work (CDN), and Web Proxy. Browser is the basic tool
for users to access and interact with digital resources;
Virtual Private Network (VPN) ensures the privacy and
security of network communication by providing users
with encrypted connections; Content Delivery Network
(CDN) effectively reduces the transmission latency of
Web services by caching and distributing content across
geographically dispersed servers, thereby significantly
improving the overall performance of the service; Web
Proxy, as an intermediate layer between users and web
servers, not only enhances the security and privacy of
users surfing the web, but also improves the speed of
web.
• Storage: Storage networks refer to networks that can pro-
vide data and file storage, including relational databases
and file storage. Relational databases serve as repositories
of structured data and provide a solid foundation for data
management and manipulation. File storage systems are
adept at managing unstructured or semi-structured data,
providing an effective method for the storage and retrieval
of documents, images, and multimedia files.
• Compute: Computing networks can provide a variety of
computing services, which are categorized into General
Purpose and Specific Purpose. General Purpose Comput-
ing networks are equipped with the ability to perform
diverse computational tasks and provide the necessary
computational resources for various applications; Specific
Purpose Computing networks, on the other hand, focus
on providing specific types of computing resources, such
as media files transcoding and data retrieval service.
• AI: AI networks provide services for the AI industry
by aggregating computing resources, including AI frame-
works, machine learning models, and GPU marketplaces.
Machine learning models can provide pre-trained models
for tasks such as natural language processing, image
recognition, predictive analytics, etc. AI Frameworks
provide a rich set of software libraries and frameworks to
support the development and deployment of AI programs;
GPU marketplace, a decentralized platform for hardware
resource leasing, provides users with leasing services for
hardware devices such as GPUs and TPUs from other
participants.
B. Operating Mechanism
We now briefly introduce the operating mechanism of a
typical DePIN system, as illustrated in Fig. 3.
In DePIN, the physical devices provided by deployers and
miners, constitute the underlying infrastructure network. De-
ployers offer corresponding devices based on the requirements
of different infrastructure networks, including sensors, servers,
wireless communication devices, and hardware acceleration
devices, among others. The devices provided by miners are
responsible for validating and packaging blockchain trans-
actions, and ultimately add the blocks that have reached

---

## Page 6

6
End Users
Software 
Devices
Frontend Layer
APIs
Frontend Decentralized Applications
Infura Web3 Jason RPC
BlockChain Network
Transactions
Logs
IIdentity System
Registration System
Device Control System
Physical Resource Network 
Sensor
Wireless 
Devices
Digital Resource Network 
Server 
Devices
Acceleration 
Hardware
Deployer
Miner
DeployReward
Update
Manage
Call Response
Call Response
MineReward
Support
Enable
Reputation System
Data Management SystemGovernance System
Fig. 3. The illustration of the operating mechanism of a typical DePIN system.
consensus to the end of chain. The resource devices deployed
by deployers are managed by the smart contract system on
the blockchain network, including the device control system
and device data management system. The device control
system coordinates hardware resources and allocates hardware
devices to users based on user’s transactions. The device data
management system manages the data uploaded by deployers’
devices and authorizes users access to the corresponding data
resources.
Users can purchase services on the frontend of DApps.
The purchase transactions are sent to the blockchain networks
through the node RPC service, where they await validation and
packaging by miners. Confirmed purchase transactions invoke
the device control system and device data management system
within the smart contract system to obtain the corresponding
hardware resources or data services. Ultimately, the fees paid
by users are transferred to deployers, who provide the services,
as compensation.
C. Market Data
In this article, we provide a comprehensive analysis of
the DePIN capital market for the period of April 2023 to
March 2024, covering the three major blockchain platforms
Ethereum, solana, and Polygon, on which market capitalization
and trading volume data of the various DePIN projects are
available, as well as the capital market performance of the
DePIN projects.
Fig. 4(a) shows the average monthly market capitalization
of the DePIN projects on Ethereum, Solana, and Polygon. The
market capitalization experienced notable growth from April
2023 to March 2024 and surged from $3.1 billion to $11.8
billion, reflecting a 326.3% annual increase. Ethereum hosted
the highest DePIN project market capitalization, representing
about 64.9% of the April 2024 average. Solana, however,
showed the most significant annual growth at 1,303.6%, sig-
naling a robust and expanding market. Despite rapid growth,
Polygon’s market capitalization share was smaller due to
a lower starting point. Furthermore, Fig. 4(b) presents the
monthly transaction volumes for the DePIN projects across
Ethereum, Solana, and Polygon from May 2023 to March
2024, highlighting a significant annual surge of 646.7%. This
sharp increase underscore the escalating market interest in
DePIN. Notably, Solana outperformed with the most impres-
sive growth rate at 707.2%. Its allure for DePIN initiatives is
largely due to its cost-effective transactions, swift processing
times, and superior scalability [14], positioning it as a favored
platform in comparison to Ethereum.
Fig. 4(c) delineates the monthly average market capitaliza-
tion across the six categories of the DePIN projects on those
three platforms from April 2023 to March 2024. The market
capitalization exhibited steady trends until October 2023,
after the market experienced a notable growth, predominantly
within the AI and Wireless categories. By the close of March
2024, AI had claimed a dominant 59.3% share of the aggre-
gated market capitalization, totaling $7.7 billion, underscoring
its pivotal influence on market expansion. The projects of
Wireless category exhibited substantial growth, establishing
both AI and Wireless as the propelling forces behind the
dynamic evolution of the DePIN market. In addition, Fig. 4(d)
shows monthly trading volume across the six categories from
May 2023 to March 2024. Despite fluctuations, the monthly
trading volume had a steady increase. AI projects notably
drove trading volume, reflecting AI’s strong global investment
appeal. Notably, Storage projects, though minor in market
capitalization (2.7%), represented a significant 10.2% of the
trading volume, indicating robust market activity and practical
demand.
Synthesizing the data in figures above, it can be concluded
that the DePIN market is growing at a rapid rate, with great
potential. For academic researchers, these findings can assist
them in gaining a deeper understanding of the prominent areas
and future development trends within DePIN.
V. CHALLENGES
In this section, we discuss the potential challenges that
DePIN may encounter across three crucial dimensions: scala-

---

## Page 7

7
Fig. 4. The DePIN projects’ market data on Ethereum, Solana, and Polygon: (a) the average monthly market values of the DePIN projects on different
blockchains; (b) the average monthly trading volumes of the DePIN projects on different blockchains; (c) the average monthly market values of the DePIN
projects under different application categories; (d) the average monthly trading volumes of the DePIN projects under different application categories.
bility, interoperability, and legality.
Scalability: Scalability is a main challenge to blockchain
technology [15] and is especially closely related to its de-
centralized nature. DePIN built on blockchain technology is
also not immune to such scalability issues. The growth in
the number of users and the expansion of the network scale
will inevitably increase the volume of transactions in the
blockchain network. In particular, the connection between
DePIN applications and the physical world imposes higher
requirements on information transmission, including the up-
loading of physical world information and service purchase
transactions, which leads to the extension of the transaction
confirmation time and the rise of transaction fees.
Interoperability: As shown in the blockchain layer of Fig.
1, DePIN ecosystem is built on top of multiple blockchains.
This requires that DePIN applications be able to support
homogeneous or heterogeneous state transitions and achieve
seamless interoperability with other blockchain networks,
which is critical to facilitating efficient communication and
data exchange across platforms. while mitigating the problem
of cross-chain operations to a certain extent, current interop-
erability solutions, such as cross-chain bridges based on zero-
knowledge proofs or trusted third parties, hooked sidechains,
hash locks, etc., are limited to specific blockchain ecosystems
or accompanied by high cross-chain costs.
Regulation: DePIN, as part of the Web 3.0 ecosystem,
also faces multiple regulatory challenges. In terms of reg-
ulatory compliance, DePIN’s decentralized and anonymous
nature makes it more difficult for regulators to monitor the
flow of funds. This characteristic may make DePIN ideal for
illicit fundraising, pyramid schemes, and money laundering
activities. In addition, in terms of tax regulations, DePIN users
can be rewarded for their participation in a variety of ways,
including by mining, and providing data, hardware, or services.
However, due to the anonymous nature of the accounts, it is
difficult for the government to collect the evidence required for
taxation, which poses a challenge to the existing tax system.
While DePIN technology shows great potential and promise,
scalability limitations, interoperability issues, and regulatory
barriers remain major obstacles to its widespread adoption. In
order to achieve sustainable growth and integration of DePIN
technology into mainstream applications, these challenges

---

## Page 8

8
must be overcome through innovative solutions.
VI. CONCLUSION
This article has propose a DePIN architecture, which com-
prises five distinct layers, namely application layer, governance
layer, data layer, blockchain layer, and infrastructure layer.
Furthermore, the article delineates four fundamental design
principles that underpin the DePIN architecture, including
intelligence, privacy and security, decentralized economy and
governance, as well as scalability and low-latency. Addition-
ally, the article categorizes the existing decentralized applica-
tions within DePIN ecosystem into a three-tiered classifica-
tion structure. Moreover, the article summarizes a operating
mechanism overview of DePIN based on DePIN’s applica-
tions. Importantly, This article investigates market data of
DePIN projects on Ethereum, Solana, and Polygon, offering
researchers a clear perspective on the project’s growth and
potential. Finally, the article introduces the challenges that De-
PIN faces, including scalability, interoperability, and regulation
issues. In conclusion, this article serves as a comprehensive
and in-depth survey to DePIN, providing researchers with a
solid foundation for comprehending DePIN.
REFERENCES
[1] D. Li, L. Deng, Z. Cai, and A. Souri, “Blockchain as a service models
in the internet of things management: Systematic review,” Transactions
on Emerging Telecommunications Technologies, vol. 33, no. 4, p. e4139,
2022.
[2] Z. Lv, L. Qiao, M. S. Hossain, and B. J. Choi, “Analysis of using
blockchain to protect the privacy of drone big data,” IEEE network ,
vol. 35, no. 1, pp. 44–49, 2021.
[3] T. Maksymyuk, J. Gazda, M. V olosin, G. Bugar, D. Horvath, M. Kly-
mash, and M. Dohler, “Blockchain-empowered framework for decen-
tralized network management in 6g,” IEEE Communications Magazine ,
vol. 58, no. 9, pp. 86–92, 2020.
[4] K. Sandberg and S. Chamberlin, “Web3 and sustainability,” Linux
F oundation Research: San Francisco, CA, USA , 2023.
[5] T. Surve and R. Khandelwal, “The development of decentralized gov-
ernance models for web 3 ecosystems,” in Concepts, Technologies,
Challenges, and the Future of Web 3 . IGI Global, 2023, pp. 91–107.
[6] Y . El Faqir, J. Arroyo, and S. Hassan, “An overview of decentralized
autonomous organizations on the blockchain,” inProceedings of the 16th
international symposium on open collaboration , 2020, pp. 1–8.
[7] W. Liu, B. Cao, and M. Peng, “Web3 technologies: Challenges and
opportunities,” IEEE Network , 2023.
[8] T. Wang, S. Zhang, Q. Yang, and S. C. Liew, “Account service network:
A unified decentralized web 3.0 portal with credible anonymity,” IEEE
Network, vol. 37, no. 6, pp. 101–108, 2023.
[9] T. I. Team, “A decentralized network for internet of things powered by a
privacy-centric blockchain,” https://s3.amazonaws.com/web-iotex-static/
home/IoTeX Whitepaper 1.5 EN.pdf.
[10] T. Wang, C. Zhao, Q. Yang, S. Zhang, and S. C. Liew, “Ethna: Analyzing
the underlying peer-to-peer network of ethereum blockchain,” IEEE
Transactions on Network Science and Engineering , vol. 8, no. 3, pp.
2131–2146, 2021.
[11] T. Rathod, N. K. Jadav, M. D. Alshehri, S. Tanwar, R. Sharma, R.-A.
Felseghi, and M. S. Raboaca, “Blockchain for future wireless networks:
A decade survey,” Sensors, vol. 22, no. 11, p. 4182, 2022.
[12] R. Belchior, A. Vasconcelos, S. Guerreiro, and M. Correia, “A survey
on blockchain interoperability: Past, present, and future trends,” ACM
Computing Surveys (CSUR) , vol. 54, no. 8, pp. 1–41, 2021.
[13] P. Winter, A. H. Lorimer, P. Snyder, and B. Livshits, “Security, privacy,
and decentralization in web3,” arXiv preprint arXiv:2109.06836 , 2021.
[14] G. A. Pierro and R. Tonelli, “Can solana be the solution to the
blockchain scalability problem?” in 2022 IEEE International Conference
on Software Analysis, Evolution and Reengineering (SANER) , 2022, pp.
1219–1226.
[15] A. I. Sanka and R. C. Cheung, “A systematic review of blockchain
scalability: Issues, solutions, analysis and future research,” Journal of
Network and Computer Applications , vol. 195, p. 103232, 2021.

---
