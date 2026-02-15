# Ballandies_2023_ATaxonomyForBlockchainBasedDePIN.pdf

## Page 1

ETH Library
A Taxonomy for Blockchain-
based Decentralized Physical
Infrastructure Networks (DePIN)
Working Paper
Author(s):
Ballandies, Mark C.; Wang, Hongyang 
 ; Chung Chee Law, Andrew; Yang, Joshua C.; Gösken, Christophe; Andrew, Michael
Publication date:
2023-10
Permanent link:
https://doi.org/https://doi.org/10.3929/ethz-b-000640008
Rights / license:
In Copyright - Non-Commercial Use Permitted
Originally published in:
Center for Law & Economics Working Paper Series 03/2023
This page was generated automatically upon download from the ETH Zurich Research Collection.
For more information, please consult the Terms of use.

---

## Page 2

 
Center for Law & Economics  
Working Paper Series 
Number 03/2023  
A Taxonomy for Blockchain-based Decentralized 
Physical Infrastructure Networks (DePIN) 
Mark C. Ballandies 
Hongyang Wang 
Andrew Chung Chee Law 
Joshua C. Yang 
Christophe Gösken 
Michael Andrew 
October 2023 (This version) 
August 2023 (First version) 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
All Center for Law & Economics Working Papers are available at  
lawecon.ethz.ch/research/workingpapers.html 

---

## Page 3

A Taxonomy for Blockchain-based Decentralized
Physical Infrastructure Networks (DePIN)
Mark C. Ballandies
Computational Social Science
ETH Zurich
bcmark@protonmail.com
Joshua C. Y ang
Computational Social Science
ETH Zurich
joshua.yang@gess.ethz.ch
Hongyang Wang
Civil Engineering
ETH Zurich
wang@ibi.baug.ethz.ch
Christophe G ¨osken
Center for Law & Economics
ETH Zurich
christophe.goesken@gess.ethz.ch
Andrew Chung Chee Law
Research Scientist
IoTeX
andrew@iotex.io
Michael Andrew
Project Initiator
Who Loves Burrito?
w.l.burrito@wholovesburrito.com
Abstract—As digitalization and technological advancements
continue to shape the infrastructure landscape, the emergence
of blockchain-based decentralized physical infrastructure net-
works (DePINs) has gained prominence. However, a systematic
categorization of DePIN components and their interrelationships
is still missing. To address this gap, we conduct a literature
review and analysis of existing frameworks and derived a
taxonomy of DePIN systems from a conceptual architecture. Our
taxonomy encompasses three key dimensions: distributed ledger
technology, cryptoeconomic design and physicial infrastructure
network. Within each dimension, we identify and deﬁne relevant
components and attributes, establishing a clear hierarchical
structure. Moreover, we illustrate the relationships and dependen-
cies among the identiﬁed components, highlighting the interplay
between governance models, hardware architectures, networking
protocols, token mechanisms, and distributed ledger technologies.
This taxonomy provides a foundation for understanding and
classifying diverse DePIN networks, serving as a basis for
future research and facilitating knowledge exchange, fostering
collaboration and standardization within the emerging ﬁeld of
decentralized physical infrastructure networks.
I. I NTRODUCTION
Traditional industries of physical infrastructures, such as
telecommunications, satellite radio, and cartography, have op-
erated under centralized control with single entities or associ-
ations of a few centralized entities of predominant authority.
With the advancement of the internet and communication
technologies, many infrastructure ecosystems instigated a de-
centralized trend against traditional centralization. However,
in recent times, these formerly open and inclusive digitized
platforms and services have increasingly shifted the focus
towards prioritizing their private interests. Such is the case
of the cartography industry, dominated by a single service
provider, Google Maps which has gradually re-centralized the
industry [1].
With blockchain technology, however, it has become pos-
sible to decentralize the physical networks of infrastructure.
M. Ballandies is supported by the European Union’s Horizon 2020 research
and innovation programme under grant agreement No 833168.
Through the implementation of automatized operation, im-
mutable common data storage and redesigned value-sensitive
governance, the potential arises for distributing control, own-
ership, and decision-making among multiple participants or
nodes in a network [2, 3, 4, 5]. Decentralized physical in-
frastructure networks (DePINs) are an emerging trend within
blockchain [6] that describes this growing ecosystem of web3
projects that utilize token incentives, smart contracts, de-
centralization, and participatory governance mechanisms of
blockchains to deploy networks of real devices such as sensors,
storage, or wireless networks globally.
Decentralization of physical networks has been recognized
to result in several beneﬁts including increased resilience [3],
due to distributing the system away from a single point of
failure and system redundancy; trust [7], due to data trans-
parency and tamper-proof guarantees; and accessibility [8]
due to permissionless requirements of joining the network.
Additionally, the operation of infrastructure can be improved
due to the re-structure of incentive mechanisms (e.g. via
blockchain-based tokens), ﬂexible decentralized marketplaces,
and inclusive participation [9].
At the time of writing, more than 50 blockchain systems can
be counted in this ecosystem with varying designs, layouts
and application domains [10]. Nevertheless, a classiﬁcation
of these systems based on a rigorously from theory derived
taxonomy is still missing. Such a taxonomy would facilitate
the differentiation and comparison among systems and en-
able researchers to identify unexplored system layouts and
practitioners to learn from others, thus facilitating innovation.
In particular, the lack of a classﬁcation of DePIN systems
on a rigorous taxonomy can result in a fragmentation of the
community and thus duplication of efforts [11].
This work contributes a ﬁrst stepping stone to conduct such
a comprehensive classiﬁcation with the following contribu-
tions:
1) A general conceptual architecture illustrating
blockchain-based systems

---

## Page 4

2) A taxonomy for DePIN derived from this conceptual
architecture
II. L ITERATURE REVIEW
Decentralized physical infrastructure networks (DePINs) are
cryptoeconomic systems. These are systems that consist of i)
individual autonomous actors, ii) economic policies embedded
in software and iii) emergent properties arising from the
interactions of those actors according to the rules deﬁned
by that software” [12]. In the case of DePIN, autonomous
actors are incentivized to place or use physical devices on
a global scale via mechanisms enabled by distributed ledger
technology (DLT) (as utilized in blockchain) from which a
physical infrastructure may arise as an emergent property.
Since such DLT-based cryptoeconomic systems are complex
systems [12] that are difﬁcult to control and govern hier-
archically from the top down due to their emergent nature,
decentralized mechanisms have been proposed and are used
in DePIN: i) For control, DLT-based tokens are used as an
incentive mechanism. In particular, such tokens can align
human behavior with goals set by a community [9] (e.g., the
establishment of a DePIN). ii) For governance, shared owner-
ship of the network can be achieved via token-based decision-
making mechanisms on system parameters, compositions and
general vision (e.g. via improvement proposals). Usually, all
token holders can participate in these processes [4, 13].
In particular, hierarchical and centralized governance mech-
anisms are often challenged in complex systems [5] and de-
centralized and bottom-up mechanisms are required to govern
and control them. For instance, these systems can be efﬁciently
governed via decentralized mechanisms such as collective
intelligence, digital democracy and self-organization [5] which
hence found not only a natural expression globally in urban
participatory budgeting projects 1 [14], or self-organizing busi-
ness teams [15], but also in blockchain-based web3 systems in
the form of decentralized autonomous organizations (DAOs).
These DAOs utilize the collective intelligence of their com-
munity (e.g. via open discussion platforms) to identify ideas
and then supports them to deliberate (e.g. via Improvement
proposals), decide (e.g. via token-based voting) and implement
(e.g. steered/ controlled via token-based incentives) them ef-
fectively [16]. Often, these mechanisms are implemented using
smart contracts. In general, this DLT-based code can improve
the functioning of society by automating and increasing the
transparency of the implemented mechanisms [17].
DePIN represents a subset of the broader blockchain IoT
domain, characterized by its utilization of physical hardware or
resources to deliver tangible or digital services to consumers.
This subset opens up new possibilities and applications within
the blockchain IoT framework, driving the emergence of
DePIN projects that cater to speciﬁc use cases in the realm
of physical service provisioning.
Because DePIN operates at this convergence of blockchain,
Internet-of-Things (IoT), and physical service delivery, certain
1Switzerland’s city of Aarau Participatory Budgeting: https://www.
stadtidee.aarau.ch/abstimmungsphase.html/1937
aspects of it can be described with existing taxonomies in
the ﬁeld of blockchain IoT [18]. Notably, i) the underlying
hardware architecture in DePIN projects shares similarities
with the utilization of hardware in acquiring data or providing
fungible or non-fungible goods and services, akin to the
perception or sensor layer observed in traditional Blockchain
IoT systems [2]. Moreover ii), drawing parallels with off-chain
compute in the context of blockchain IoT systems [19], the
middleware plays a pivotal role in processing, storing, trans-
porting data, and relaying services acquired by the hardware
layer in DePIN projects.
The establishment of a comprehensive taxonomy is of
paramount importance in providing clear guidelines for stake-
holders aiming to foster the growth of emerging sectors. While
the Internet of Things (IoT) taxonomy has been thoroughly
explored in the literature [20], and the advent of blockchain
and blockchain IoT has gained substantial popularity, resulting
in the emergence of general DLT taxonomies (see [11] for an
overview) and fewer blockchain IoT works [21, 22], due to its
recent history and distinct characteristics focus on instantiating
infrastructure networks, there remains a conspicuous absence
of well-deﬁned taxonomy for DePIN that combines previously
introduced taxonomies from DLT and IoT and extends them
to be applicable for infrastructure networks.
In order to close this gap, this work introduces a rigorously
derived taxonomy for DePIN that considers the cryptoe-
conomic design, distributed ledger technology and physical
infrastructure components of DePINs.
III. M ETHODOLOGY
This work follows the method of Nickerson et al. [23] for
deriving a taxonomy for DePIN and performs one iteration of
the Conceptual-to-empirical step: 1. An established concep-
tual architecture and taxonomy of Blockchain systems [11]
is extended by theoretical reasoning considering the meta-
characteristic ”Functioning of decentralized physical infras-
tructure networks”. 2. DePIN systems are classiﬁed based on
that taxonomy and 3. The taxonomy is revised.
IV. C ONCEPTUAL ARCHITECTURE
Considering the meta-characteristic and the exploration in
Section II, the conceptual architecture found in literature [11]
is extended such that it illustrates the inner mechanisms of
DePIN and the interrelationships of their components.
Because DePIN are about physical infrastructures, both
a hardware and a middleware component are added to the
conceptual architecture.
Further, as governance is an important component of DLT
systems [24], the governance component has been integrated
into the conceptual architecture. In particular, the original
Action component has been renamed to core economy action
to better separate the economic and governance aspects of a
DePIN system.
Finally, to make the implemented mechanisms of DePIN
such as tokens and DAOs more transparent and decentralized,
on-chain features of DLT such as smart contracts are often

---

## Page 5

Location Component Deﬁnition Chain
Governance action A governance action is one or more real-life activities connected to
governance that can be digitally represented in a DLT system
Core action
A core action is one or more real-life activities connected to the
economy of the system that can be digitally represented in a DLT
system.
Real World
Hardware Hardware are physical devices required to participate in the
(core economy of the) DLT system.
Middleware Middleware are services such as storage, communication, or messaging
between components within a DLT system that are not covered by DLT.
Consensus
Consensus is the mechanism through which entries are written to the
distributed ledger, while adhering to a set of rules that all participants
enforce when an entry containing transactions is validated.
off-chain
DL A distributed ledger is deﬁned as a distributed data structure,
containing entries that serve as digital records of actions.
Smart contracts Smart contracts are code or mechanisms that are deployed to the
distributed ledger and executed by a DLT system.
Digital World
Token Token is a unit of value issued within a DLT system and which can
be used as a medium of exchange or unit of account.
on-chain
TABLE I: Components of the conceptual architecture for DePIN modeled on Ballandies et al. [11]. Shown in gray are the
components that were added to account for DePIN.
used. Therefore, the Smart Contracts component was added to
illustrate which parts of a DePIN are secured and supported
by DLT.
V. T AXONOMY
Based on the conceptual architecture (Section IV), further
components and attributes are added to the Taxonomy intro-
duced in [11]. The taxonomy is illustrated in Figure 1 and the
main differences are explained below.
A. Hardware
The hardware component, which represents the hardware
used in the DLT system in more detail, has been added to the
new Physical Infrastructure Network (PIN) dimension of the
taxonomy (Figure 1). Device illustrates what hardware devices
system participants are required to obtain in order to partici-
pate in the core economy of the network. The characteristics
can be in the context of DePIN for instance camera (e.g.
HiveMapper or NA TIX) or LoRaWAN hotspot (e.g. Helium).
Ecosystem illustrates the degree of openness of the hardware
ecosystem. The characteristic is open if any manufacturers
devices can be utilized to participate in the core economy
(e.g. onocoy or WiHi) or licensed if a manufacturer is required
to get a license before being able to produce devices for the
system (e.g. Helium) or closed if manufacturing is restricted to
speciﬁc manufacturers (e.g. GEODNET). Spacing illustrates
if devices are required to have a minimum distance from each
other. The characteristic is Y es if there are measures in place
to facilitate a particular spacing between devices and No if
devices can be placed anywhere. For instance, in the case of
DePINs in the ﬁeld of global navigation satellite systems such
as onocoy or GEODNET, overpopulation of hardware devices
in a given area is not desirable as it does not bring any further
beneﬁt to the network, while in the case of the Render network,
which builds a decentralized GPU infrastructure, such spacing
is not required.
B. Middleware
The middleware component, which illustrates the middle-
ware used in the DLT system that is not executed on-chain
(e.g., via smart contracts), was added to the new Physical
Infrastructure Network (PIN) dimension (Figure 1). Data
access illustrates the degree of decentralization in the storage
and access of system data required for the core economy
and governance. The characteristics are open if the public
can participate in storing and accessing the data important
for the systems functioning or restricted if only selected
entities can provide this service. For instance, solutions such as
Filecoin [25] can facilitate the storing of system information
in a decentralized way in a DePIN system. Routing access
illustrates the degree of decentralization in the routing of data
between system participants/ devices of the core economy
and governance. The characteristics are open if the public
can participate in the routing of information important for
the systems’ functioning or restricted if only selected enti-
ties can route information. For instance, solutions such as
W3bstream [26] or Streamr [27] can be utilized by a DePIN
to facilitate the routing of information in a decentralized way.
Computing access illustrates the degree of decentralization in
the computation of system mechanisms/ quantities of the core
economy and governance.
C. Core economy action
The core economy component is extended with one at-
tribute. Incentivized action Illustrates if and which of the
actions taken in the core economy is incentivized with the

---

## Page 6

Fig. 1: The taxonomy with its three dimensions (distributed ledger technology (DLT), pysicial infrastructure network (PIN),
and cryptoeconomic design (CED)), 8 components and 41 attributes.
awarding of token units. The characteristics can be for instance
in the DePIN context hardware placement, but in a more
general context also staking, or system parameter calibration .
D. Governance
The governance component is added to the cryptoeconomic
design (CED) of the taxonomy.
Idea crowd-sourcing illustrates who can express ideas in
system channels that can be used in the deliberation process
and thus represents the collective intelligence of a DePIN. The
characteristics can be public or restricted. Idea deliberation
illustrates who can create, propose, curate, and merge voteable
items. V ote objects identiﬁes on what system participants can
vote. The characteristics are system parameters , improvement
proposals, governance bodies , a combination of the previous,
or none. For instance, in DePIN systems, often token holders
can vote on improvement proposals (e.g. Helium, DIMO
or Render). In some DeFi systems (e.g. MakerDAO) token
holders can also directly vote on system parameter conﬁgura-
tions. V ote participationillustrates who can participate in the
voting. It is public if anyone/ any Token holder can vote or
restricted if a voter is required to fulﬁll further requirements
such as know-your-customer policies besides owning tokens
and closed if voting is not accessible for token holders.
V oting input illustrates how the votes can be cast by an
address or unique identity. The feature can be Single choice
(e.g. utilized in Helium), if the voters can select one option.
Multiple-selection if voters can select several options (e.g.
utilized in DIMO), or Ranked-choice (e.g. utilized in DIMO),
if the voters rank the different choices according to their
preference; Quadratic [28] (e.g. modiﬁed version utilized in
onocoy), when voters use credits to vote for options, but the
cost of casting multiple votes for the same option increases
quadratically. V oting aggregation illustrates the methods of
aggregation. This is the calculation of votes after the action
of voting. These methods may involve amongst other Simple
Majority (> 50%) or Super Majority (> 66%, e.g. as in
Helium). Founder/ core-team identity illustrates the degree
to which the identity of the system initiators and implementors
are known. Legal structure illustrates the legal interpretation
of the governance components, according to international, re-
gional and/or national laws and regulations. For instance, often
DePIN system utilize a Foundation as the IP-owning entity
(e.g. Helium, DIMO, Render). Nevertheless, also other setups
exists, such as in the case of onocoy where an association is
chosen to be the IP-owning entity. Location illustrates where
the DePIN operates and which laws and regulations apply to
it.
E. Smart contracts
The smart contract component has been added to the DLT
dimension of the taxonomy. [ Governance, Core economy,
Middleware] illustrates the degree to which the [ governance,
core economy, middleware ] of the system is implemented on-
chain. The charactersitic is all if the whole, partial if a part,
and none if no [ governance, core economy, middleware ] is
implemented on-chain.
VI. F INDINGS
Through our efforts to classify DePIN projects using the
proposed taxonomy, four observations are obtained:

---

## Page 7

First, the analysis shed light on the signiﬁcant variations in
the level of decentralization within the governance design of
DePIN projects. It became evident that some projects exhib-
ited a centralized approach, where decision-making authority
predominantly resides with a hierarchically organized core
team, while in others a self-organizing community participates
actively in decision-making processes through diverse voting
mechanisms. Mostly this open governance participations in
DePIN systems is restricted to improvements proposals which
are not legally binding and thus neither impact system param-
eters nor the governance body/ workings of IP-owing legal
entities directly.
Second, though there are solutions with for instance
W3ebstrem, Streamr, Filecoin and others to decentralize off-
chain middleware, the middleware in DePIN systems is cur-
rently often centralized (maintained by centralized entities and
deployed to centralized cloud architectures).
Third, DePIN projects are inherently complex, encompass-
ing multifaceted elements. Thus, acquiring comprehensive
information is a challenging endeavour. Different DePIN
projects showcased different levels of openness and acces-
sibility of information. Information pertaining to governance
structures, software and hardware technical details, as well as
investor information and fundraising mechanisms, were often
difﬁcult to obtain. This lack of transparency and availability
of information poses a notable hurdle in comprehensively
understanding and evaluating DePIN projects. For instance,
initially a investor identity attribute had been added to the
Governance component, but was removed because of the
inability to clearly assign a value for it for classiﬁed systems.
Fourth, it can be a challenge to measure attributes of a De-
PIN or DLT system quantitatively. For instance, the taxonomy
had the information access attribute to illustrate how open
the information regarding the system (for instance, including
the internal strategies of the core team) are, resp. who has
access to them. For instance, more transparency/ openness
would indicate an improved collective intelligence [5] of the
community and thus would be important to be classiﬁed.
Besides these observations, it was noticed that the exten-
sion of the conceptual architecture/ taxonomy introduced in
Ballandies et al. [29] with the new components and attributes
of this work did not restrict the taxonomy’s explanatory
capability to illustrate non-DePIN related DLT systems. For
instance, the hardware device in the Bitcoin system are ASICS
and the incentivized action is proof-of-work participation.
Finally, the term ’DePIN’ has been used widely to refer
to decentralized token-incentivized blockchain networks or
systems, however, more recently, there has been a push to
clearly delineate between physical networks and strictly digital
resources such as ’computational resources’. We found that
the taxonomy can clearly illustrate the difference between
DePIN and non-DePIN systems: Whenever the incentivized
action in a system is the placement or contribution of physical
infrastructure elements to the system, such as a camera or
storage drives, it can be deﬁned as a DePIN system.
VII. C ONCLUSION AND OUTLOOK
This taxonomy paper has presented a comprehensive and
novel framework for classifying DePIN based on cryptoeco-
nomic design, distributed ledger technologies and physical in-
frastructure network dimensions that span 8 components rang-
ing from tokens over governace to consensus and hardware.
It intends to provide a valuable foundation for understanding
and categorizing DePIN.
Further research could focus on addressing the challenges
associated with information availability and complexity within
the DePIN domain. This could include initiatives to develop
standardized reporting frameworks, guidelines for information
disclosure, and collaborative efforts to create comprehensive
databases of DePIN projects. By addressing these issues, the
understanding and evaluation of DePIN projects can be sig-
niﬁcantly enhanced, contributing to the broader development
and adoption of decentralized physical infrastructure networks.
Beyond infrastructure networks, the broader context of the
built environment, including smart cities and intelligent build-
ings, holds signiﬁcant potential for further DePIN research.
For instance, integrating DePIN with artiﬁcial intelligence
(AI), creates opportunities for autonomous, and sovereign
infrastructure and buildings [30].
Additionally, this taxonomy framework has the versatility to
be applied to other vertical studies within the broader domain
of decentralized infrastructure. It offers opportunities for cross-
disciplinary collaboration and facilitates knowledge sharing
across different sectors, such as value-sensitive governance de-
sign, organizational structure studies, complex systems, legal
and regulatory studies, and other vertical theoretical explo-
rations. In particular, a rigorous crowd-sourced classiﬁcation,
analysis and validation can further enhance the taxonomy and
derive general design patterns [11].
REFERENCES
[1] Jean-Christophe Plantin. Digital traces in context—
google maps as cartographic infrastructure: From par-
ticipatory mapmaking to database maintenance. Interna-
tional journal of communication , 12:18, 2018.
[2] Alessandra Pieroni, Noemi Scarpato, and Lorenzo Felli.
Blockchain and iot convergence—a systematic survey on
technologies, protocols and security. Applied Sciences ,
10(19):6749, 2020.
[3] Rodrigo Roman, Jianying Zhou, and Javier Lopez. On
the features and challenges of security and privacy in
distributed internet of things. Computer networks , 57
(10):2266–2279, 2013.
[4] Hongyang Wang, Jens Hunhevicz, and Daniel Hall. What
if properties are owned by no one or everyone? foun-
dation of blockchain enabled engineered ownership. In
EC3 Conference 2022 , volume 3, pages 0–0. University
of Turin, 2022.
[5] Dirk Helbing, Sachit Mahajan, Regula H ¨anggli Fricker,
Andrea Musso, Carina I Hausladen, Cesare Carissimo,
Dino Carpentras, Elisabeth Stockinger, Javier Argota
Sanchez-V aquerizo, Joshua C Y ang, et al. Democracy by

---

## Page 8

design: Perspectives for digitally assisted, participatory
upgrades of society. Journal of Computational Science ,
71:102061, 2023.
[6] Sami Kassab. The depin sector map. https://messari.
io/report/the-depin-sector-map, 2023. (Accessed on
03/07/2023).
[7] Primavera De Filippi, Morshed Mannan, and Wessel Rei-
jers. Blockchain as a conﬁdence machine: The problem
of trust & challenges of governance. Technology in
Society, 62:101284, 2020.
[8] Satoshi Nakamoto. Bitcoin: A peer-to-peer electronic
cash system. page 9.
[9] Marcus M Dapp, Dirk Helbing, and Stefan Klauser. Fi-
nance 4.0-Towards a Socio-Ecological Finance System:
A Participatory Framework to Promote Sustainability .
Springer Nature, 2021.
[10] Michael Andrew. Depin project list, 2023. URL https:
//wholovesburrito.com/project-list/.
[11] Mark C Ballandies, Marcus M Dapp, and Evange-
los Pournaras. Decrypting distributed ledger de-
sign—taxonomy, classiﬁcation and blockchain commu-
nity evaluation. Cluster computing , 25(3):1817–1838,
2022.
[12] Mark Christopher Ballandies. Fundamentals of Cryp-
toeconomics: On the design, construction, and impact
of blockchain-based systems and incentives . PhD thesis,
ETH Zurich, 2022.
[13] Felix Machart and Jascha Samadi. Governance by and
of blockchains. page 115.
[14] Vitalik Buterin and Nathan Schneider. Proof of stake: the
making of Ethereum, and the philosophy of blockchains .
Seven Stories Press, 2022.
[15] Frederic Laloux and Ken Wilber. Reinventing organiza-
tions: A guide to creating organizations inspired by the
next stage of human consciousness , volume 360. Nelson
Parker Brussels, 2014.
[16] Ralph C Merkle. DAOs, democracy and governance.
page 28.
[17] Nuri Heckler and Y eonkyung Kim. Crypto-governance:
The ethical implications of blockchain in public service.
Public Integrity , 24(1):66–81, 2022.
[18] Abdelzahir Abdelmaboud, Abdelmuttlib Ibrahim Abdalla
Ahmed, Mohammed Abaker, Taiseer Abdalla Elfadil
Eisa, Hashim Albasheer, Sara Abdelwahab Ghorashi, and
Faten Khalid Karim. Blockchain for iot applications:
taxonomy, platforms, recent advances, challenges and
future research directions. Electronics, 11(4):630, 2022.
[19] Jiewu Leng, Ziying Chen, Zhiqiang Huang, Xiaofeng
Zhu, Hongye Su, Zisheng Lin, and Ding Zhang. Secure
blockchain middleware for decentralized iiot towards in-
dustry 5.0: A review of architecture, enablers, challenges,
and directions. Machines, 10(10):858, 2022.
[20] Ibrar Y aqoob, Ejaz Ahmed, Ibrahim Abaker Targio
Hashem, Abdelmuttlib Ibrahim Abdalla Ahmed, Abdul-
lah Gani, Muhammad Imran, and Mohsen Guizani. In-
ternet of things architecture: Recent advances, taxonomy,
requirements, and open challenges. 24(3):10–16. ISSN
1536-1284. doi: 10.1109/MWC.2017.1600421. URL
http://ieeexplore.ieee.org/document/7955906/.
[21] Tan G ¨urpinar, Maximilian Austerjost, Josef Kamphues,
Jonas Maaßen, Furkan Yildirim, and Michael Henke.
Blockchain technology as the backbone of the internet
of things–an introduction to blockchain devices. In
Proceedings of the Conference on Production Systems
and Logistics: CPSL 2022 , pages 733–743. Hannover:
publish-Ing., 2022.
[22] Nils Siegfried, Tobias Rosenthal, and Alexander
Benlian. Blockchain and the industrial internet of
things: A requirement taxonomy and systematic
ﬁt analysis. 35(6):1454–1476. ISSN 1741-
0398. doi: 10.1108/JEIM-06-2018-0140. URL
https://www.emerald.com/insight/content/doi/10.1108/
JEIM-06-2018-0140/full/html.
[23] Robert C Nickerson, Upkar V arshney, and Jan Munter-
mann. A method for taxonomy development and its
application in information systems. European Journal
of Information Systems , 22(3):336–359, 2013.
[24] Andrej Zwitter and Jilles Hazenberg. Decentralized net-
work governance: blockchain technology and the future
of regulation. Frontiers in Blockchain , 3:12, 2020.
[25] Yiannis Psaras and David Dias. The interplanetary ﬁle
system and the ﬁlecoin network. In 2020 50th Annual
IEEE-IFIP International Conference on Dependable Sys-
tems and Networks-Supplemental V olume (DSN-S), pages
80–80. IEEE, 2020.
[26] Xinxin Fan, Zhi Zhong, Dong Guo, Qi Chai, and Simone
Romano. Connecting smart devices to smart contracts
with w3bstream. In 2023 IEEE International Conference
on Blockchain and Cryptocurrency (ICBC) , pages 1–2.
IEEE, 2023.
[27] Petri Savolainen, Santeri Juslenius, Eric Andrews,
Miroslav Pokrovskii, Sasu Tarkoma, and Henri Pihkala.
The streamr network: Performance and scalability.
url: https://streamrpublic. s3. amazonaws. com/streamr-
network-scalability-whitepaper-2020-08-20. pdf .
[28] Steven P Lalley and E Glen Weyl. Quadratic voting:
How mechanism design can radicalize democracy. In
AEA Papers and Proceedings , volume 108, pages 33–37.
American Economic Association 2014 Broadway, Suite
305, Nashville, TN 37203, 2018.
[29] Mark C. Ballandies, Marcus M. Dapp, and Evan-
gelos Pournaras. Decrypting distributed ledger de-
sign—taxonomy, classiﬁcation and blockchain commu-
nity evaluation. 25(3):1817–1838. ISSN 1386-7857,
1573-7543. doi: 10.1007/s10586-021-03256-w. URL
https://link.springer.com/10.1007/s10586-021-03256-w.
[30] Jens Juri Hunhevicz, Hongyang Wang, Lukas Hess, and
Daniel Hall. no1s1–a blockchain-based dao prototype for
autonomous space. In Proceedings of the 2021 European
Conference on Computing in Construction , volume 2,
pages 27–33. University College Dublin, 2021.
View publication stats
Powered by TCPDF (www.tcpdf.org)
Powered by TCPDF (www.tcpdf.org)

---
