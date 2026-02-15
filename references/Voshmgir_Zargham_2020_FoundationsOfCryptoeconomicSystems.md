# Voshmgir_Zargham_2020_FoundationsOfCryptoeconomicSystems.pdf

## Page 1

Foundations of Cryptoeconomic Systems
Voshmgir, Shermin; Zargham, Michael
DOI:
10.57938/0d57c21f-6e9d-4e94-89ff-ec2d4d64583e
Published: 16/11/2019
Document Version:
Publisher's PDF, also known as Version of record
Document License:
Unspecified
Link to publication
Citation for published version (APA):
Voshmgir, S., & Zargham, M. (2019). Foundations of Cryptoeconomic Systems. Research Institute for
Cryptoeconomics, WU Vienna. Working Paper Series / Institute for Cryptoeconomics / Interdisciplinary Research
No. 1 https://doi.org/10.57938/0d57c21f-6e9d-4e94-89ff-ec2d4d64583e
Download date: 04. Feb 2026

---

## Page 2

Foundations of Cryptoeconomic Systems
By Shermin Voshmgir and Michael Zargham ∗
Blockchain networks and similar cryptoeconomic networks are
systems, speciﬁcally complex systems. They are adaptive networks
with multi-scale spatiotemporal dynamics. Individual actions to-
wards a collective goal are incentivized with “purpose-driven” to-
kens. These tokens are equipped with cryptoeconomic mecha-
nisms allowing a decentralized network to simultaneously main-
tain a universal state layer, support peer-to-peer settlement, and
incentivize collective action. These networks therefore provide a
mission-critical and safety-critical regulatory infrastructure for au-
tonomous agents in untrusted economic networks. They also pro-
vide a rich, real-time data set reﬂecting all economic activities
in their systems. Advances in network science and data science
can thus be leveraged to design and analyze these economic sys-
tems in a manner consistent with the best practices of modern
systems engineering. Research that reﬂects all aspects of these so-
cioeconomic networks needs (i) a complex systems approach, (ii)
interdisciplinary research, and (iii) a combination of economic and
engineering methods, here referred to as “economic systems engi-
neering,” for the regulation and control of these socio-economic
systems. This manuscript provides foundations for further re-
search activities that build on these assumptions, including spe-
ciﬁc research questions and methodologies for future research in
this ﬁeld.
I. Introduction
Cryptoeconomics is an emerging ﬁeld of economic coordination games in cryptographically
secured peer-to-peer networks. The term cryptoeconomics was casually coined in the developer
community. The earliest recording is a citation from a talk by Vlad Zamﬁr in 2015 (Zamﬁr,
2015), which was later loosely formalized in blog posts and talks by Vitalik Buterin (Buterin,
2017a), (Buterin, 2017b). The term gained traction by the developer community (Tomaino,
2017a) and the by the academic community (Berg, Davidson and Potts, 2019) but it still re-
mains under-deﬁned, possibly because it is often used in diﬀerent contexts. Using the same term
in diﬀerent contexts leads to diﬀerent meanings and communication breakdowns when trying
to come up with a general purpose deﬁnition of that term. This paper explores why the term
“cryptoeconomics” is context dependent and proposes complementary micro, meso and macro
deﬁnitions of the term. These context dependent deﬁnitions build on the perspectives outlined
in this paper regarding the nature of cryptoeconomic systems such as the Bitcoin Network, and
provides a foundation for further research in the area of cryptoeconomic systems.
II. A Complex Systems Perspective
Systems theory (Bertalanﬀy, 1969) (Meadows, 2008) provides a means to describe any system
by its structure, purpose, functioning, as well as spatial and temporal boundaries, including its
inter-dependencies with its environments (Moﬀatt and Kohler, 2008) (Parrott and Lange, 2013).
∗ Shermin Voshmgir: Director, Research Institute for Cryptoeconomics, Vienna University of Economics,
Werlthandesplatz 2, 1020 Wien, Austria, voshmgir@wu.ac.at. Michael Zargham: CEO, BlockScience, 471 McAuley St
Oakland CA, USA, zargham@block.science.
1

---

## Page 3

2 CRYPTOECONOMICS WORKING PAPER SERIES, VIENNA UNIVERSITY OF ECONOMICS NOV. 2019
Figure 1. Cryptoeconomic systems are complex socio-economic systems.
Complex systems theory investigates the relationships between system parts with the system’s
collective behaviors and the system’s environment (Nagel, 2012).
Complex systems diﬀer from other systems, in that the system behaviour cannot be easily
inferred from the state changes induced by network actors (Parrott and Lange, 2013). Modeling
approaches that ignore such diﬃculties will produce models that are not useful for modeling
and steering those system.
Properties such as emergence, nonlinearity, adaptation, spontaneous order, and feedback loops
are typical to complex systems (Bar-Yam, 2002). Complex systems research draws contributions
from various scientiﬁc domains such as mathematics, biology, physics, psychology, meteorology,
sociology, economics, and engineering (Parrott and Lange, 2013) which all contribute to com-
plexity science, leveraging both analysis and synthesis; analytic processes reduce systems to
better understand their parts, whereas synthesis is required to understand the whole as greater
than the sum of its parts (Quine, 1951).
Systems theory can contribute tools for the analysis of how the relationships and dependencies
between a cryptoeconomic systems’ parts can determine system-wide properties. It allows for
the discovery of system’s dynamics, constraints, conditions and principles of cryptoeconomic
networks with the aim to understand, model and steer them.
A cryptoeconomic system like the Bitcoin Network can be described as a special class of com-
plex socioeconomic system that is dynamic, adaptive and multi-scale. Cryptoeconomic networks
are dynamic due to the ﬂow of information and assets through the network. Cryptoeconomic
networks are adaptive because their behaviour adjusts in response to their environment, either
directly in the case of the Bitcoin diﬃculty controller or more broadly through decisions on the
part of node operators. Cryptoeconomic networks are multi-scale because they are speciﬁed
by local protocols but are deﬁned by their macro-scale properties, as is the case with the local
“no double spend” rule guaranteeing a globally conserved token supply (Zargham, Zhang and
Preciado, 2018). Their design requires a strong interdisciplinary approach to develop resilient
protocols that account for their spatial and temporal dynamics of those networks (Liaskos,
Wang and Alimohammadi, 2019).
III. An Interdisciplinary Perspective
Interdisciplinary research has been identiﬁed as an appropriate research method when (i) the
research subject involves complex systems and when (ii) the research question is not conﬁned to
a single discipline (Repko, 2008). The necessity of an interdisciplinary approach to the research

---

## Page 4

VOL. 1 NO. 1 FOUNDATIONS OF CRYPTOECONOMIC SYSTEMS 3
of complex systems has been addressed by General Systems Theory (Bertalanﬀy, 1969), in
particular Cybernetics (Wiener, 1965), (Barkley Rosser, 2010). Economists like Friedrich Hayek
for example were inﬂuenced by the interdisciplinary ﬁeld of Cybernetics which leveraged systems
theory methods available in his time (Oliva, 2016), (Lange, 2014).
The interdisciplinary research process is often heuristic, iterative and reﬂexive, and borrows
methods from speciﬁc disciplines, where appropriate. It is deeply rooted in the disciplines, but
oﬀers a corrective to the disciplinary way of knowledge creation (Dezure, 1999) transcending
disciplinary knowledge via the process called integration (Repko, 2008). While disciplines are
regarded as foundational, they are also regarded as inadequate to address complex problems,
sacriﬁcing comprehensiveness and neglecting important research questions that fall outside disci-
plinary boundaries. Given the fact that blockchain networks and similar crptoeconomic systems
provide a governance infrastructure (Voshmgir, 2017) for socio-economic activities, a symbiosis
of both disciplinary and interdisciplinary research is needed to achieve the necessary breath and
depth related to complex systems (Repko, 2008).
The research process includes: (i) identiﬁcation of relevant disciplines, (ii) mapping research
questions to identify the disciplinary parts, (iii) reducing the number of potentially relevant
disciplines, (iv) literature review in relevant disciplines and for relevant research questions, (v)
developing adequacy in relevant disciplines, (vi) analyzing problems and evaluating insights,
(vii) integrating insights and creating common ground for insights (Repko, 2008).
Figure 2. Venn diagram of disciplines related to cryptoeconomic systems engineering.
Relevant disciplines include Operations Research and Management Science, Industrial and
Systems Engineering, AI, Optimization and Control Theory, Computer Science and Cryptog-
raphy, Psychology and Decisions Science, Political Science and Governance, Philosophy, Law
and Ethics, as well as Economics and Game Theory. The wide range of disciplines may seem

---

## Page 5

4 CRYPTOECONOMICS WORKING PAPER SERIES, VIENNA UNIVERSITY OF ECONOMICS NOV. 2019
arbitrary but they are in fact bound by a central concept: allocation of resources. In particular,
cryptoeconomic networks provide coordination and scaling for resource allocation decisions of
stakeholders with unique preferences, information, and capabilities. Allocation decisions being
made include resources which are (i) physical such as hardware and electricity, (ii) ﬁnancial
such as tokens or ﬁat money, and (iii) social such as attention, e.g. governance participation,
code contributions or evangelism. Envisioning, designing and governing cryptoeconomic systems
requires the following questions to be considered:
• Who gets to make which decisions, under which circumstances, and to whom are they
accountable for those decisions? Furthermore, how does this change over time?
• How do individuals make decisions given knowledge of the rules of the system, and subject
to uncertainty about the decisions of others?
• How can a system be engineered to processes individual decision making into collective
decision making such that system may be interpreted as coordinating toward a shared
purpose?
Unsurprisingly, disciplinary bias and disciplinary jargon (Repko, 2008) are challenges that
need to be overcome in the interdisciplinary research process. Addressing this class of chal-
lenges adequately in cryptoeconomics research will be crucial to advancing research in this
ﬁeld. The existence of disciplinary jargon will require the development of a common language,
or a Rosetta Stone (Gilbert, 1998) to facilitate cross disciplinary communication. Autoethno-
graphic experience of the authors has furthermore shown that multidisciplinary teams members
require methods to facilitate the transfer of the state of knowledge between researchers of diﬀer-
ent disciplines. These “knowledge state updates” require time and eﬀort and make the research
process slower than in disciplinary research setups.
IV. The Evolution of Cooperation Perspective
While cryptoeconomics is interdisciplinary by nature, it has so far predominantly been de-
veloped in the computer science community. The economic assumptions made and methods
used in most existing protocols are rather limited compared with the existing body of relevant
literature. There is still much room to incorporate methods from various economic disciplines,
that are very often interdisciplinary in themselves, like for example political economy (politi-
cal science) or behavioural economics (cognitive psychology) and business law (legal studies)
(Voshmgir, 2019a). The idea, for example, that the coordination of a cryptoeconomic system
is derived from pure self-interest of individual actors is a conjecture, which while useful as a
narrative is unlikely to be factual. For example, the Miner’s Dilemma (Eyal, 2015) implies
that the observed mining pools would break down under pure selﬁshness. The mathematical
and game theoretic arguments about cryptoeconomic networks are based on the canonical re-
sults on the evolution of cooperation in an iterative prisoners dilemma (Axelrod and Hamilton,
1981), (Rapoport, Chammah and Orwant, 1965). These results demonstrate that coordination
is possible (suﬃcient condition) in the presence of selﬁsh actors, not that it is ‘only possible’
(necessary conditions) in the presence of selﬁsh actors. Therefore, it is entirely possible and
actually more likely that cryptoeconomic systems exist as a result of a mixture of strategies, also
referred to as norms as in more recent work on the evolution of cooperation (Yamamoto et al.,
2017), (Peters and Adamou, 2019). The iterated prisoner’s dilemma is an approximation of a
complex social phenomena, (Axelrod, 1997), and continued study has provided additional in-
sights around concepts such as indirect reciprocity (Nowak, 2006) and meta-incentives (Okada
et al., 2015), which are directly relevant to the study of cryptoeconomics, in so far as it is
viewed as means to engineer incentives that make cooperative norms resistant to invasion by
selﬁsh ones in cryptoeconomic networks. In the evolution of cooperation literature theoretical,
computational and empirical methods are applied to the study of populations of agents making
individual decisions according to certain strategies, with an emphasis on the non-obvious system
level properties that arise, and how these properties induce changes in future behavior.

---

## Page 6

VOL. 1 NO. 1 FOUNDATIONS OF CRYPTOECONOMIC SYSTEMS 5
V. A Multiscale Perspective
Economic systems are often observed to have properties that are not directly attributable
to the agents, processes and policies that make up the economic system. Understanding the
emergent properties as arising from relationships between the agents, processes and policies
requires the multiscale perspective. Through a synthesis of these perspectives on multi-scale
systems, a basic formula for framing practical economic models is shown in Figure 3. Any model
requires assumptions about the properties of its constituent parts and assumptions about the
environment or larger system in which the model is embedded. Couched in economic terms the
model of the larger system provides macro-economic context and the models of the constituent
parts provide micro-economic foundations.
Figure 3. Micro-Economic foundations and Macro-Economic context together form the basis
of a multi-scale model required to capture interscale eﬀects common in complex systems.
Applying a multiscale perspective to economic systems is not a new idea. It has been addressed
implicitly by representatives of the Austrian School of Economics, and also other heterodox
economic schools including Complexity Economics (Foster, 2005), (Montuori, 2005), (Bateson
et al., 1989) and Ecological Economics (Common and Stagl, 2005), (Schumacher, 2011). While
Ecological Economics was originally motivated by ecology rather than systems theory, it also
criticized the failings of the orthodox economic canon in addressing the complex dynamics that
arise when there are interaction eﬀects between parts and wholes with special attention to
human activity as being a part of the natural world. A recently yet widely accepted idea in
macroeconomics, the Lucas Critique (Lucas, 1976) explicitly addresses feedback eﬀects between
micro and macro scale behavior. The need for multiscale representations is further borne out
in Evolutionary Economics (Dopfer, Foster and Potts, 2004) and in the standard practice of
systems engineering (Hamelin, Walden and Krueger, 2010).
Through the multiscale perspective, it is possible to study interscale phenomena such as
emergence as shown in Figure 4. “Emergence (...) refers to the arising of novel and coherent
structures, patterns and properties during the process of self organization in complex systems.
Emergent phenomena are conceptualized as occurring on the macro level in contrast to the
micro level components and processes out of which they arise.” (Goldstein, 1999).
Emergence closes the feedback loop of the macro, meso and micro level activities where
policy makers measure phenomena on a macro level, decide over new policies on a meso level,
and implement these policies impacting agent behavior a micro level, which in turn result in
systemic eﬀects that can only be measured on a macro level. An example of Multi-scale feedback
in the Bitcoin Network is the interaction between the proof-of-work game being played between

---

## Page 7

6 CRYPTOECONOMICS WORKING PAPER SERIES, VIENNA UNIVERSITY OF ECONOMICS NOV. 2019
Figure 4. Multi-Scale Feedback: In cryptoeconomic networks the system level behavior emerges
from the agent level behavior responding to rules and incentives implemented as part of cryp-
toeconomic policy design.
the agents (miners), and the Bitcoin Network itself. By introducing a feedback loop to correct
the diﬃculty1 and maintain the ten minute block time, the system itself becomes part of the
game. One way of viewing this macro-scale game is as a two player game between the miners as
a population and the network itself. The miners as a collective have their action space deﬁned
by the total hashpower provided and the network’s action space is to set the diﬃculty. Even
though all of the miners know what strategy the network is playing, the fact that they are still
playing a micro-scale game with each other leads to increases in hashpower despite the fact that
this is objectively more expensive than providing less hashpower for the same predetermined
block rewards. This example shows the necessity of multi-scale models for cryptoeconomic
systems because neither the micro-scale game played between the entities running nodes, nor
the macro-scale game between the Bitcoin Network and miners is suﬃcient to characterize the
system dynamics.
VI. A Network Science Perspective
A cryptoeconomic system is a kind of complex system that can be represented by interacting
components that collectively form a network. Informally, a network is a group or system of
interconnected people or things. A formal mathematical deﬁnition of a network is a graph
G “tV,Eu made up of a set of vertices V and set of edges E ĎVˆV. The edges are simply
pairs of vertices and when the order of the vertices matters, the edge pi, jq is said to be directed
from i to j. Applying graph theory to study social and economic networks is called network
science and therefore relevant in the context of analyzing and modeling cryptoeconomic systems.
As networks grow the number of relationships between entities quickly dwarfs the number of
entities in the network (Dorogovtsev and Mendes, 2004). Furthermore, the topology of the net-
work itself can have signiﬁcant inﬂuence on processes playing out within the network (Newman,
2010) (Boccaletti et al., 2006). The interactions between the parts of the system, including agent
1To compensate for increasing hardware speed and varying interest in running nodes over time, the proof-of-work
diﬃculty is determined by a moving average targeting an average number of blocks per hour. If they’re generated too fast,
the diﬃculty increases.(Nakamoto, 2008)

---

## Page 8

VOL. 1 NO. 1 FOUNDATIONS OF CRYPTOECONOMIC SYSTEMS 7
behaviors, and between the system and its environment often result in unexpected emergent
properties, which in practice necessitates some form of human governance for cryptoeconomic
networks (Voshmgir, 2019a). A cryptoeconomic system like a blockchain network is a multi-
graph because it has diﬀerent types of vertices and edges which include labeling maps for the
vertices and edges. Depending on the type of network the vertices can be: (i) nodes representing
computer software in the peer to peer computation and communication network , (ii) accounts
are addresses in the ﬁnancial network, (iii) entities are identities of people and organizations in
an oﬀ-chain socioeconomic network. Vertices are depicted in Table 1.
Vertex Type Deﬁnition
Entity Oﬀ-chain unique identity of a person or organization
Account On-chain address controllable via a private key
Node Software and hardware participating in a peer-to-peer network
Table 1— Vertex Types & Deﬁnitions in the Bitcoin System
Entity Account Node
Entity has relationship with controls keys of operates
Account transfers funds to
Node sends rewards to is peer of
Table 2— Edge types and deﬁnitions to be read as directed edges from column to row.
A cryptoeconomic network consists of three interconnected networks: (i) the computation and
communication network comprised of nodes that leverage a peer-to-peer protocol to validate
transactions by mining new blocks, (ii) the ﬁnancial network comprised of Bitcoin addresses
which may sign transactions and transfer funds, and the (iii) the oﬀ-chainsocioeconomic network
representing people and organizations that control the tokens in the ﬁnancial network and
operate those nodes in the computation and communication network. As a summary of the
types of edges is provided in table 2. Incidentally, this hierarchical layering of networks is
consistent with strategies for optimization decomposition (Chiang et al., 2007) providing a
formal basis vertically integrated network economies. In blockchain networks, the base layer
data structure comes with cryptographic guaranties, but does not represent a human readable
ledger, rather a formal mapping to the statespace representation is required to lift the data
from its hash space to the record of accounts, which is recognizable as a ledger (Shorish, 2018).
VII. Tokens as System State
Tokens represent a part of the state of any cryptoeconomic systems and can be seen as their
atomic unit. Universal state refers to a unique set of data (the ledger) that is collectively
managed by all nodes is the network. Tokens are a representation of an individualized state of
an economic system, including a speciﬁc right to change the system state. The existence of a
universal state (Voshmgir, 2019a) makes tokens provable and durable and is a solution to the
double spending (Nakamoto, 2008) of digital values over the public networks. The existence of
tokens in general and digital tokens in particular is not new. Cryptoeconomic systems, however,
provide a public infrastructure that allow the issuance and management of tokens at a fraction
of transaction costs (Voshmgir, 2019a). The speed with which cryptoeconomic systems and
their tokenized applications are being deployed, is an indicator for the pervasiveness of the
technology and its applications (Filippova, 2019). Tokens, as the atomic unit of state, can make
all socio-economic activities visible. However, it is unclear if and when the tokenization of all
economic activities will become feasible.

---

## Page 9

8 CRYPTOECONOMICS WORKING PAPER SERIES, VIENNA UNIVERSITY OF ECONOMICS NOV. 2019
Asset tokens and access-right tokens (Voshmgir, 2019a) represent business and governance
systems that are mostly well understood, and can be categorized as “simple token systems”.
They can be modeled and steered with existing reductionist tools, which explain systems in
terms of their constituent parts and the individual interactions between them (Lipset, 1980),
often, but not always, reducing systems to the sum of its parts (Ruse, 2005).
Purpose-driven tokens are tokens that are programmed to steer automated collective action
of autonomous network actors in a public network towards a collective goal in the absence of
intermediaries (Voshmgir, 2019b). They represent “complex token systems” and require com-
plex system approach (Foster and Metcalfe, 2012)(Kurtz and Snowden, 2003) to be modelled.
Purpose-driven tokens that enable complex token systems diﬀer from simple token systems in
that they close the loop in so far as the system becomes autonomous and is not being steered
by single institutions.
Simple token systems require mostly “legal engineering”, which we deﬁne as the intersec-
tions of information systems and legal studies and deals with the question of how to make
these tokenized use cases regulatory compliant. Complex token systems requires mostly “eco-
nomic systems engineering”, which we deﬁne on the intersection of information systems and
economics including political economy and other related social science domains. Economic
systems engineering can build on systems engineering (Sage, 1992), (Blanchard and Fabrycky,
1990),(Novikov, 2016), but deals with research questions that model and steer aggregate agent
behaviour, which brings us into the emerging ﬁeld of complex systems engineering (Bar-Yam,
2003) (Rhodes and Hastings, n.d.).
VIII. A Unifying Perspective on Cryptoeconomics
Cryptoeconomic systems are complex socioeconomic networks deﬁned by (i) individual au-
tonomous actors, (ii) economic policies embedded in software and (iii) emergent properties
arising from the interactions of those actors according to the rules deﬁned by that software.
A comprehensive deﬁnition of cryptoeconomics therefore includes three levels of analysis: (i)
micro-foundational, relating to agent level behaviors (ii) meso-institutional, relating to policy
setting and governance and (iii) macro-observerable, relating to the measurement and analysis
the system level metrics.
“Micro-foundational” characteristics of cryptoeconomic systems are commonly expressed in
terms of algorithmic game theory in the computer science literature (Nisan et al., 2007) and
mechanism design in the economics literature (Hurwicz and Reiter, 2006). Mechanism design
is sometimes referred to as reverse game theory as it pertains to the construction of games to
produce speciﬁc behaviors from agents. Nakamoto Consensesus is a cryptoeconomic mechanism
designed to provide an equilibrium such that a public and permissionless network is resistant to
attack. An attack would be any violation of the state transition rules encoded in the protocol;
one such attack is a double spend. Nakamoto consensus uses a combination of cryptographic
tools with economic incentives that make economic cost of wrongdoing disproportionate to the
beneﬁt of doing so (Voshmgir, 2019a). Proof-of-stake mechanisms provide similar game theoretic
arguments for network security. Most current deﬁnitions of cryptoeconomics focus on this level
of analysis and modeling (Buterin, 2017a), (Buterin, 2017b) (Tomaino, 2017a).
However, the level of security very much depends on how people react to economic incentives,
which in turn has been a ﬁeld of study in economics (Voshmgir, 2019a); the security of the
network is an emergent macro level property. “Macro-observables” are system-wide metrics
or properties which may inform decision-making of stakeholders within the system. Macro-
observables often include performance indicators that impact governance decisions at the meso-
institutional level as well as measures that can impact perception and thus behavior at the micro-
foundational level. In addition to security, market capitalization, price (Shorish, 2019), (Cong,
Li and Wang, 2019) and price stability are the most commonly studied macro-observables.
These macro properties are integrated into the governance feedback loop on the meso level.
“Meso-institutional” characteristics encompass decision-making and goal determination, based
upon macro-observables and requiring micro-foundations. This level builds on political science,

---

## Page 10

VOL. 1 NO. 1 FOUNDATIONS OF CRYPTOECONOMIC SYSTEMS 9
Table 3. Cryptoeconomics ˚
Level of Economic Governance Design Bitcoin
Analysis Perspective Perspective Perspective Reference
Global Policy Goals Performance Stability,Macroa
Outcomes Measurement Metrics Security, etc.
Institutional Policy Goal Performance InformalMesob
Dynamics Setting Targets Governance :
Protocol Implementation Asserted NakamotoMicroc
Foundations of Incentives Properties Consensus
˚Cryptoeconomics relates three interactions layers or levels of analysis that
deﬁne characteristics at the micro-foundational, meso-institutional, and macro-
observerable domains of scope.
aMacro-observables are system global properties that inform decision-making
at the meso-institutional level and provide stakeholder feedback, performance in-
dicators and measures that can impact micro-foundational properties.
bMeso-institutional characteristics encompass decision-making and goal de-
termination, based upon and requiring micro-foundations. Mechanism design as
used in Economics informs institutions, organisations and teams.
cMicro-foundational characteristics are assumption speciﬁcations with a nat-
ural expression within mechanism design as used within Computer Science.
:Informal Governance is a form of decentralized governance whereby changes
to the protocol are made locally by individual participants operating nodes in the
peer-to-peer network and changes only take eﬀect if the majority of participants
adopt the change. In the case of Nakamoto Consensus such a majority is measured
in hashpower.
law, governance and economics to design the steering processes of communities, by some re-
ferred to as institutional cryptoeconomics (Berg, Davidson and Potts, 2019). Ethical design
and informed governance of cryptoeconomic systems resides in the meso-institutional level and
requires an understanding of both the micro-foundations, macro-observables as well as the re-
lations between them.
IX. Research Directions
Drawing upon the assumptions outlined in this paper, cryptoeconomic systems provide a
institutional infrastructure that facilitates a wide range of socio-economic interactions. The
design space for this infrastructure includes novel interaction patterns thanks to the peer-to-peer
protocols support for state dependence via tokens. Research regarding the analysis and design
of cryptoeconomic systems is necessarily interdisciplinary. Building on other interdisciplinary
research future work includes but is not limited to the following topics: (a) purpose-driven
tokens, (b) data driven economies, (c) ethics of decision algorithms as social infrastructure, (d)
applying computational social science to cryptoeconomic systems, (e) applying cyberphysical
systems engineering to cryptoeconomic design and analysis.
A. Purpose-Driven Tokens
Bitcoin’s “Proof-of-Work” (Nakamoto, 2008) introduced an incentive mechanism to get net-
work actors to collectively manage a distributed ledger in a truthful manner, by rewarding them
with network tokens which are minted upon “proof-of” a certain behaviour. The idea of align-
ing incentives among a tribe of anonymous actors with a network token, introduced a new type
of public infrastructure that is autonomous, self-sustaining, and attack resistant (Voshmgir,
2019b). Such networks, therefore, represent a collectively produced and collectively consumed
economic infrastructure. This common economic infrastructure can be viewed as a commons
whose design and governance should be held to Ostrom’s principles (Ostrom, 1990). If there is
an underlying optimal choice to be uncovered through a social process there is some hope that

---

## Page 11

10 CRYPTOECONOMICS WORKING PAPER SERIES, VIENNA UNIVERSITY OF ECONOMICS NOV. 2019
this optimal could be learned via a consensus process, (Jadbabaie et al., 2012). However, it is
more realistic to take a polycentric viewpoint where there is no one social optimal and thus it
is important to take a wider view of social choice (Arrow, 2012) (Ostrom, 2000) before embark-
ing on the design of a purpose-driven token. After all any choice of coordination objective is
a subjective choice. Assuming one can deﬁne a common objective, the token designer would
encode this objective as a cost function and strive for dynamic stability around a minimum cost
outcome over time as is done with dynamic potential games (Candogan, Ozdaglar and Parrilo,
2013), swarm robotics (Gazi and Passino, 2003) and vehicle formations(Olfati-Saber and Mur-
ray, 2002). In all cases the design goal is strong emergence around some objective (Klein et al.,
2001). It is also possible to envisage the objective selection process as dynamic consensus (Kia
et al., 2019). Broadly speaking purpose-driven token design lives at the boundary of behavioral
economics and dynamic decentralized coordination in multi-agent systems which bridges with
institutional economics(Coase, 1998), and in particular platform economics (Rochet and Tirole,
2003).
Figure 5. Governance feedback loop of cryptoeconomic systems
B. Data Driven Economic Systems
Cryptoeconomic systems provide near real-time data of on-chain economic activities, and
may govern access rights or provide proofs related to data stored oﬀ-chain. The advancement
in machine learning and system identiﬁcation methods over the past decade has increased our
capacity for creating novel, useful models in across a wide range of applications (Jordan and
Mitchell, 2015), and in the context of economics (Mullainathan and Spiess, 2017) in particular.
This, for the ﬁrst time, allows for almost real time steering of these economies and a level of
applied cybernetics that was not possible before. Furthermore, it increases the precision of
modeling and measurement required for steering these economies. This results in a data driven
regulatory process, as shown in Figure 5.
However, the advances of machine learned models (Jordan and Mitchell, 2015) is a conse-
quence of the growth of the digital economy that captures a large amount of economic data.
This data is largely controlled by large tech ﬁrms operating platform based services which are
often subject to algorithmic bias (Garcia, 2016), (Lewis and Westlund, 2015),(Sætra, 2019),
(Von Foerster, 2003). The stateful nature of cryptoeconomic systems has the potential to cede
control over data back to the users of these platforms, if privacy by design is considered in the
modeling of the cryptoeconomic systems and their applications (Voshmgir, 2019a).

---

## Page 12

VOL. 1 NO. 1 FOUNDATIONS OF CRYPTOECONOMIC SYSTEMS 11
C. Ethics and Governance of Decision Algorithms in Social Systems
Assumptions that are programmed into the cryptoeconomic protocols might be biased and
will be subject to a line of ethical studies around how the associated cryptoeconomic systems
behave over time. All algorithms are designed based on models; models are always reductions
of reality based on some assumptions, and therefore must be judged by their usefulness to
some ends,(Box, 1976). This places the focus on the assumptions embedded in the models
and the eﬀects those assumptions have on people. The machine learning and cryptoeconomic
systems design communities share a common need to address ethical questions about the social-
systemic eﬀects of algorithm design and implementation (Orlikowski and Scott, 2015). To design
or govern algorithms which make decisions requires a theory of fairness such as Rawl’s Veil of
Ignorance (Rawls, 1958) (Heidari et al., 2018). Fairness cannot be expected to emerge from
purely self-interested agents because fairness provides a constraint on proﬁt seeking behavior
(Kahneman, Knetsch and Thaler, 1986). As a result, a code of ethics for algorithm designers,
as found in other engineering disciplines (Pugh, 2009), is required.
Furthermore, it is important to note that data governance (Soares, 2015) is not equivalent
to protocol governance. Data governance relates to the management of rights to read, write
or manipulate data. Emerging data economies much respect regulations such as General Data
Protection Regulation (Voigt and Von dem Bussche, 2017) and therefore one cannot simple store
private or sensitive information in a public ledger where it cannot be deleted. However, data
governance can be addressed through business process automation (Ter Hofstede et al., 2009)
using smart contracts (Christidis and Devetsikiotis, 2016) which encode the aforementioned
rights to read, write or manipulate data which is stored using other cryptographic technologies
such as a content addressable distributed hash tables (Benet, 2014). Federated machine learning
(Bonawitz et al., 2017)(Geyer, Klein and Nabi, 2017) is a growing area of research but practical
implementation is hindered by the ethical and regulatory requirement that there are guarantees
of privacy preservation (Ahmad, Stoyanov and Lovat, 2019).
D. Computational Social Science
Computational social science (Johnson and Lux, 2011), is a particularly relevant branch of
interdisciplinary research for cryptoeconomic systems. The ﬁeld of social science that uses
computational approaches in studying the social phenomena (Cioﬃ-Revilla, 2016). Modern
computational social science is much more deeply coupled with behavioral economics and data
science where advanced computational statistics are combined with social networks, market
dynamics, and more (Easley and Kleinberg, 2010), (Jackson, 2008). The advancing power of
computation has lead some to refer to computational science as a “new kind of science” (Wol-
fram, 2002). This paradigm is backed up by an emerging computational epistemology (Kelly,
2000) (Blum and Blum, 1975) (Chaitin, 2011). It is precisely in the context of complex systems
that counter-intuitive outcomes are common, and computational methods expose unforeseen
pitfalls before they can cause irrecoverable harm (Forrester, 1971) (Merton, 1936). Computa-
tional methods in cryptoeconomic systems combine data science tools with system dynamics and
agent based models to explore the relation between agent behavior and protocol design (Zhang,
Zargham and Preciado, 2019). The approach of combining data, with theory and computation
is consistent with methods in econophysics (Lux, 2009) and ergodicity economics (Peters and
Adamou, 2018), though in the case of cryptoeconomics volume and precision of data available
for backtesting models is higher.
E. Cyberphysical Systems Engineering
In the ﬁeld of engineering, especially for large scale cyberphysical systems, computer aided
design is standard practice,(Baheti and Gill, 2011) (Rajkumar et al., 2010). The United States
National Science Foundation deﬁnes a cyberphysical system (CPS) as a mechanism that is
controlled or monitored by computer-based algorithms, tightly integrated with the Internet and
its users. In cyberphysical systems, physical and software components are deeply intertwined,

---

## Page 13

12 CRYPTOECONOMICS WORKING PAPER SERIES, VIENNA UNIVERSITY OF ECONOMICS NOV. 2019
each operating on diﬀerent spatial and temporal scales, exhibiting multiple and distinct behavioral
modalities, and interacting with each other in a lot of ways that change with context (NSF, 2010),
(Lee, 2006).
Examples of existing cyberphysical systems include power grids and large scale transportation
systems, which both share the property that behavior of uncontrolled human actors can create
undesirable or even unsafe conditions in entirely counter-intuitive ways. A common criticism
for using this analogy is the presence of attackers, but this a common concern in the CPS
literature,(Cardenas et al., 2009),(Barreto et al., 2014). In practice, the design, operation and
governance of such large scale systems is accomplished through computational models called
digital twins, (Grieves and Vickers, 2017) (Uhlemann, Lehmann and Steinhilper, 2017) which
are also closely related to the practice of model based systems engineering (Estefan et al., 2007).
Model based systems engineering has previously been applied for multi-agent systems (DeLoach,
Wood and Sparkman, 2001) (Fallah et al., 2010), and the relation from cryptoeconomic networks
to cyberphysical systems has already been observed in the literature, (Bahga and Madisetti,
2016).
The systems engineering methodology (Hamelin, Walden and Krueger, 2010) as applied to
cyberphysical systems relies on a composite of theoretical, computational and empirical meth-
ods (Banerjee et al., 2011); thus building on the experimental economic tradition (Roth, 2002)
(Kagel and Roth, 2016). A natural path forward is to treat cryptoeconomic systems as cy-
berphysical systems and to approach them with the diligence an engineer must aﬀord to any
public infrastructure (Hou et al., 2015). As with other complex engineered systems, informed
governance requires both specialized tools and expertise, so even when governance systems are
polycentric the parties responsible for governance are accountable to public they serve (Walch,
2015)(Ostrom, 2010). To do so, it is necessary to develop a holistic perspective for cryptoeco-
nomic systems which relates the locally implemented protocols, behavioral response to those
mechanisms and the systemic properties that emerge therefrom.
REFERENCES
Ahmad, Omer F., Danail Stoyanov, and Laurence B. Lovat.2019. “Barriers and Pitfalls
for Artiﬁcial Intelligence in Gastroenterology: Ethical and Regulatory issues.” Techniques in
Gastrointestinal Endoscopy, 150636.
Arrow, Kenneth J. 2012. Social choice and individual values. Vol. 12, Yale university press.
Axelrod, Robert. 1997. The complexity of cooperation: Agent-based models of competition
and collaboration. Vol. 3, Princeton University Press.
Axelrod, Robert, and William D Hamilton. 1981. “The evolution of cooperation.”science,
211(4489): 1390–1396.
Baheti, Radhakisan, and Helen Gill.2011. “Cyber-physical systems.” The impact of control
technology, 12(1): 161–166.
Bahga, Arshdeep, and Vijay K Madisetti. 2016. “Blockchain platform for industrial in-
ternet of things.” Journal of Software Engineering and Applications , 9(10): 533.
Banerjee, Ayan, Krishna K Venkatasubramanian, Tridib Mukherjee, and Sandeep
Kumar S Gupta. 2011. “Ensuring safety, security, and sustainability of mission-critical
cyber–physical systems.” Proceedings of the IEEE, 100(1): 283–299.
Barkley Rosser, J. 2010. “How complex are the Austrians?” In What is so Austrian about
Austrian Economics?. 165–179. Emerald Group Publishing Limited.
Barreto, C., J. Giraldo, ´A. A. C´ ardenas, E. Mojica-Nava, and N. Quijano. 2014.
“Control Systems for the Power Grid and Their Resiliency to Attacks.” IEEE Security Pri-
vacy, 12(6): 15–23.

---

## Page 14

VOL. 1 NO. 1 FOUNDATIONS OF CRYPTOECONOMIC SYSTEMS 13
Bar-Yam, Yaneer.2002. “General features of complex systems.” Encyclopedia of Life Support
Systems (EOLSS), UNESCO, EOLSS Publishers, Oxford, UK , 1.
Bar-Yam, Yaneer. 2003. “When systems engineering fails-toward complex systems engineer-
ing.” Vol. 2, 2021–2028, IEEE.
Bateson, Gregory, et al. 1989. The individual, communication, and society: Essays in mem-
ory of Gregory Bateson. Cambridge University Press.
Benet, Juan. 2014. “Ipfs-content addressed, versioned, p2p ﬁle system.” arXiv preprint
arXiv:1407.3561.
Berg, C., S. Davidson, and J. Potts. 2019. Understanding the Blockchain Economy: An
Introduction to Institutional Cryptoeconomics. New horizons in institutional and evolutionary
economics series, Edward Elgar Publishing.
Bertalanﬀy, Ludwig von. 1969. “General system theory: Foundations, development, appli-
cations.”
Blanchard, Benjamin S, and Wolter J Fabrycky.1990. Systems engineering and analysis.
Vol. 4, Prentice Hall Englewood Cliﬀs, NJ.
Blum, Lenore, and Manuel Blum. 1975. “Toward a mathematical theory of inductive
inference.” Information and Control , 28(2): 125 – 155.
Boccaletti, S., V. Latora, Y. Moreno, M. Chavez, and D.U. Hwang. 2006. “Complex
Networks: Structure and Dynamics.” Physics Reports, 424(4): 175–308.
Bonawitz, Keith, Vladimir Ivanov, Ben Kreuter, Antonio Marcedone, H Brendan
McMahan, Sarvar Patel, Daniel Ramage, Aaron Segal, and Karn Seth. 2017.
“Practical secure aggregation for privacy-preserving machine learning.” 1175–1191, ACM.
Box, George EP. 1976. “Science and statistics.” Journal of the American Statistical Associ-
ation, 71(356): 791–799.
Buterin, Vitalik. 2017a. “The Meaning of Decentralization.”
Buterin, Vitalik. 2017b. “Introduction to Cryptoeconomics.”
Candogan, Ozan, Asuman Ozdaglar, and Pablo A Parrilo. 2013. “Dynamics in near-
potential games.” Games and Economic Behavior , 82: 66–90.
Cardenas, Alvaro, Saurabh Amin, Bruno Sinopoli, Annarita Giani, Adrian Perrig,
Shankar Sastry, et al. 2009. “Challenges for securing cyber physical systems.” Vol. 5.
Chaitin, Gregory J. 2011. Metaphysics, metamathematics and metabiology. World Scientiﬁc,
Singapore.
Chiang, M., S.H. Low, A.R. Calderbank, and J.C. Doyle. 2007. “Layering as optimiza-
tion decomposition: A mathematical theory of network architectures.” Proceedings of the
IEEE, 95(1): 255–312.
Christidis, Konstantinos, and Michael Devetsikiotis. 2016. “Blockchains and smart con-
tracts for the internet of things.” Ieee Access, 4: 2292–2303.
Cioﬃ-Revilla, Claudio. 2016. “Bigger Computational Social Science: Data, Theories, Mod-
els, and Simulations–Not Just Big Data.” Theories, Models, and Simulations–Not Just Big
Data (May 24, 2016) .
Coase, Ronald. 1998. “The new institutional economics.” The American Economic Review ,
88(2): 72–74.

---

## Page 15

14 CRYPTOECONOMICS WORKING PAPER SERIES, VIENNA UNIVERSITY OF ECONOMICS NOV. 2019
Common, Michael, and Sigrid Stagl. 2005. Ecological Economics: An Introduction. Cam-
bridge University Press.
Cong, Lin William, Ye Li, and Neng Wang. 2019. “Tokenomics: Dynamic adoption and
valuation.” Becker Friedman Institute for Research in Economics Working Paper , , (2018-
49): 2018–15.
DeLoach, Scott A, Mark F Wood, and Clint H Sparkman. 2001. “Multiagent sys-
tems engineering.” International Journal of Software Engineering and Knowledge Engineer-
ing, 11(03): 231–258.
Dezure, Deborah. 1999. “Interdisciplinary teaching and learning.” Teaching excellence: to-
ward the best in the academy , 10(3): 1–2.
Dopfer, K., J. Foster, and J Potts. 2004. “Micro-Meso-Macro.” Journal of Evolutionary
Economics, Springer–Verlag.
Dorogovtsev, Sergei N, and Jos´ e FF Mendes. 2004. “The shortest path to complex
networks.” arXiv preprint cond-mat/0404593.
Easley, D., and J. Kleinberg. 2010. Networks, Crowds, and Markets. Vol. 8, Cambridge
University Press.
Estefan, Jeﬀ A, et al. 2007. “Survey of model-based systems engineering (MBSE) method-
ologies.” Incose MBSE Focus Group, 25(8): 1–12.
Eyal, Ittay. 2015. “The miner’s dilemma.” 89–103, IEEE.
Fallah, Yaser P, ChingLing Huang, Raja Sengupta, and Hariharan Krishnan. 2010.
“Design of cooperative vehicle safety systems based on tight coupling of communication,
computing and physical vehicle dynamics.” 159–167, ACM.
Filippova, E. 2019. “Empirical Evidence and Economic Implications of Blockchain as a General
Purpose Technology.” 1–8.
Forrester, Jay W. 1971. “Counterintuitive behavior of social systems.” Technological Fore-
casting and Social Change , 3: 1–22.
Foster, John. 2005. “From simplistic to complex systems in economics.” Cambridge Journal
of Economics, 29(6): 873–892.
Foster, John, and J. Stan Metcalfe.2012. “Economic emergence: An evolutionary economic
perspective.” Journal of Economic Behavior & Organization , 82(2): 420 – 432. Emergence in
Economics.
Garcia, Megan. 2016. “Racist in the machine: The disturbing implications of algorithmic
bias.” World Policy Journal , 33(4): 111–117.
Gazi, Veysel, and Kevin M Passino. 2003. “Stability analysis of swarms.” IEEE transac-
tions on automatic control , 48(4): 692–697.
Geyer, Robin C, Tassilo Klein, and Moin Nabi. 2017. “Diﬀerentially private federated
learning: A client level perspective.” arXiv preprint arXiv:1712.07557 .
Gilbert, Lewis E. 1998. “Disciplinary breadth and interdisciplinary knowledge production.”
Knowledge, Technology & Policy, 11(1-2): 4–15.
Goldstein, Jeﬀrey. 1999. “Emergence as a Construct: History and Issues.” Emergence,
1(1): 49–72.

---

## Page 16

VOL. 1 NO. 1 FOUNDATIONS OF CRYPTOECONOMIC SYSTEMS 15
Grieves, Michael, and John Vickers. 2017. “Digital twin: Mitigating unpredictable, unde-
sirable emergent behavior in complex systems.” In Transdisciplinary perspectives on complex
systems. 85–113. Springer.
Hamelin, R Douglas, David D Walden, and Michael E Krueger. 2010. “4.4. 2 incose
systems engineering handbook v3. 2: Improving the process for se practitioners.” Vol. 20,
532–541, Wiley Online Library.
Heidari, Hoda, Claudio Ferrari, Krishna Gummadi, and Andreas Krause. 2018.
“Fairness behind a veil of ignorance: A welfare analysis for automated decision making.”
1265–1276.
Hou, Yunfei, Yunjie Zhao, Aditya Wagh, Longfei Zhang, Chunming Qiao, Kevin F
Hulme, Changxu Wu, Adel W Sadek, and Xuejie Liu. 2015. “Simulation-based test-
ing and evaluation tools for transportation cyber–physical systems.” IEEE Transactions on
Vehicular Technology, 65(3): 1098–1108.
Hurwicz, L., and S. Reiter. 2006. Designing Economic Mechanisms. Cambridge University
Press.
Jackson, M.O. 2008. Social and Economic Networks. Princeton University Press.
Jadbabaie, Ali, Pooya Molavi, Alvaro Sandroni, and Alireza Tahbaz-Salehi. 2012.
“Non-Bayesian social learning.” Games and Economic Behavior , 76(1): 210 – 225.
Johnson, Neil, and Thomas Lux. 2011. “Financial systems: Ecology and economics.” Na-
ture, 469(7330): 302.
Jordan, Michael I, and Tom M Mitchell. 2015. “Machine learning: Trends, perspectives,
and prospects.” Science, 349(6245): 255–260.
Kagel, John H, and Alvin E Roth. 2016. The handbook of experimental economics. Vol. 2,
Princeton university press.
Kahneman, Daniel, Jack L Knetsch, and Richard H Thaler. 1986. “Fairness and the
assumptions of economics.” Journal of business , S285–S300.
Kelly, Kevin T. 2000. “The logic of success.” Philosophy of science today , 11–38.
Kia, S. S., B. Van Scoy, J. Cortes, R. A. Freeman, K. M. Lynch, and S. Martinez.
2019. “Tutorial on Dynamic Average Consensus: The Problem, Its Applications, and the
Algorithms.” IEEE Control Systems Magazine , 39(3): 40–72.
Klein, Mark, Hiroki Sayama, Peyman Faratin, and Yaneer Bar-Yam. 2001. “What
complex systems research can teach us about collaborative design.” 5–12, IEEE.
Kurtz, Cynthia F, and David J Snowden. 2003. “The new dynamics of strategy: Sense-
making in a complex and complicated world.” IBM systems journal , 42(3): 462–483.
Lange, Oskar. 2014. Introduction to economic cybernetics. Elsevier.
Lee, Edward A. 2006. “Position Paper for NSF Workshop On Cyber-Physical Systems: Re-
search Motivation, Techniques and Roadmap.”
Lewis, Seth C, and Oscar Westlund. 2015. “Big data and journalism: Epistemology, ex-
pertise, economics, and ethics.” Digital journalism, 3(3): 447–466.
Liaskos, S., B. Wang, and N. Alimohammadi. 2019. “Blockchain Networks as Adaptive
Systems.” 139–145.
Lipset, D. 1980. Gregory Bateson: The Legacy of a Scientist. Prentice-Hall.

---

## Page 17

16 CRYPTOECONOMICS WORKING PAPER SERIES, VIENNA UNIVERSITY OF ECONOMICS NOV. 2019
Lucas, Robert E. 1976. “Econometric policy evaluation: A critique.” Carnegie-Rochester
Conference Series on Public Policy , 1: 19 – 46.
Lux, Thomas. 2009. “Applications of statistical physics in ﬁnance and economics.”
Meadows, Donella H. 2008. Thinking in systems: A primer. chelsea green publishing.
Merton, Robert K. 1936. “The Unanticipated Consequences of Purposive Social Action.”
American Sociological Review, 1(6): 894–904.
Moﬀatt, Sebastian, and Niklaus Kohler. 2008. “Conceptualizing the built environment as
a social–ecological system.” Building research & information , 36(3): 248–268.
Montuori, Alfonso. 2005. “Gregory Bateson and the promise of transdisciplinarity.” Cyber-
netics & Human Knowing , 12(1-2): 147–158.
Mullainathan, Sendhil, and Jann Spiess. 2017. “Machine learning: an applied econometric
approach.” Journal of Economic Perspectives , 31(2): 87–106.
Nagel, Thomas. 2012. Mind and Cosmos: Why the Materialist Neo-Darwinian Conception
of Nature Is: Why the Materialist Neo-Darwinian Conception of Nature is Almost Certainly
False. Oxford University Press USA.
Nakamoto, Satoshi. 2008. “Bitcoin: A Peer-to-Peer Electronic Cash System.”
https://bitcoin.org/bitcoin.pdf, Accessed: 2015-07-01.
Newman, M. E. 2010. Networks: An Introduction. Oxford University Press.
Nisan, Noam, Tim Roughgarden, Eva Tardos, and Vijay V Vazirani.2007. Algorithmic
game theory. Cambridge university press.
Novikov, Dmitry. 2016. “Systems Theory and Systems Analysis. Systems Engineering.”
Vol. 47, 39–44.
Nowak, Martin A. 2006. “Five rules for the evolution of cooperation.” science,
314(5805): 1560–1563.
NSF. 2010. “Cyber-Physical Systems Program Solicitation.”
Okada, Isamu, Hitoshi Yamamoto, Fujio Toriumi, and Tatsuya Sasaki. 2015. “The
Eﬀect of Incentives and Meta-incentives on the Evolution of Cooperation.” PLOS Computa-
tional Biology, 11(5): 1–17.
Olfati-Saber, Reza, and Richard M. Murray. 2002. “Distributed Cooperative Control
Of Multiple Vehicle Formations Using Structural Potential Functions.” IFAC Proceedings
Volumes, 35(1): 495 – 500. 15th IFAC World Congress.
Oliva, Gabriel. 2016. “The road to servomechanisms: the inﬂuence of Cybernetics on Hayek
from the sensory order to the social order.” In Research in the History of Economic Thought
and Methodology. 161–198. Emerald Group Publishing Limited.
Orlikowski, Wanda, and Susan V Scott.2015. “The algorithm and the crowd: Considering
the materiality of service innovation.”
Ostrom, Elinor. 1990. Governing the commons: The evolution of institutions for collective
action. Cambridge university press.
Ostrom, Elinor. 2000. “Collective action and the evolution of social norms.” Journal of eco-
nomic perspectives, 14(3): 137–158.
Ostrom, Elinor. 2010. “Beyond markets and states: polycentric governance of complex eco-
nomic systems.” American economic review, 100(3): 641–72.

---

## Page 18

VOL. 1 NO. 1 FOUNDATIONS OF CRYPTOECONOMIC SYSTEMS 17
Parrott, Lael, and Holger Lange. 2013. “An introduction to complexity science.” In Man-
aging Forests as Complex Adaptive Systems . 31–46. Routledge.
Peters, Ole, and Alexander Adamou. 2018. Ergodicity Economics. London Mathematical
Laboratory.
Peters, Ole, and Alexander Adamou. 2019. “An evolutionary advantage of cooperation.”
Pugh, E. W. 2009. “Creating the IEEE Code of Ethics.” 1–13.
Quine, Willard V. 1951. “Main trends in recent philosophy: Two dogmas of empiricism.”
The philosophical review, 20–43.
Rajkumar, Ragunathan, Insup Lee, Lui Sha, and John Stankovic. 2010. “Cyber-
physical systems: the next computing revolution.” 731–736, IEEE.
Rapoport, Anatol, Albert M Chammah, and Carol J Orwant. 1965. Prisoner’s
dilemma: A study in conﬂict and cooperation. Vol. 165, University of Michigan press.
Rawls, John. 1958. “Justice as fairness.” The philosophical review, 67(2): 164–194.
Repko, Allen F. 2008. Interdisciplinary research: Process and theory. Sage.
Rhodes, Donna, and Daniel Hastings. n.d.. “The Case for Evolving Systems Engineering
as a Field within Engineering Systems.”
Rochet, Jean-Charles, and Jean Tirole. 2003. “Platform competition in two-sided mar-
kets.” Journal of the european economic association , 1(4): 990–1029.
Roth, Alvin E. 2002. “The economist as engineer: Game theory, experimentation, and com-
putation as tools for design economics.” Econometrica, 70(4): 1341–1378.
Ruse, Michael. 2005. “Models in Science.” In The Oxford companion to philosophy . , ed. Ted
Honderich. OUP Oxford.
Sætra, Henrik Skaug. 2019. “The tyranny of perceived opinion: Freedom and information in
the era of big data.” Technology in Society, 59: 101155.
Sage, A. P. 1992. “Environment, rationality perspectives, and coordination structures for
decision aiding in complex distributed organizational systems.” 874–879 vol.1.
Schumacher, Ernst Friedrich. 2011. Small is beautiful: A study of economics as if people
mattered. Random House.
Shorish, Jamsheed. 2018. “Blockchain State Machine Representation.” SocArXiv.
Shorish, Jamsheed. 2019. “Hedonic pricing of cryptocurrency tokens.” Digital Finance.
Soares, Sunil. 2015. The chief data oﬃcer handbook for data governance. Mc Press.
Ter Hofstede, Arthur HM, Wil MP Van der Aalst, Michael Adams, and Nick
Russell. 2009. Modern Business Process Automation: YAWL and its support environment.
Springer Science & Business Media.
Tomaino, Nick. 2017a. “Cryptoeconomics 101.”
Uhlemann, Thomas H-J, Christian Lehmann, and Rolf Steinhilper. 2017. “The dig-
ital twin: Realizing the cyber-physical production system for industry 4.0.” Procedia Cirp,
61: 335–340.
Voigt, Paul, and Axel Von dem Bussche.2017. “The eu general data protection regulation
(gdpr).” A Practical Guide, 1st Ed., Cham: Springer International Publishing .

---

## Page 19

18 CRYPTOECONOMICS WORKING PAPER SERIES, VIENNA UNIVERSITY OF ECONOMICS NOV. 2019
Von Foerster, Heinz. 2003. “Ethics and second-order cybernetics.” In Understanding under-
standing. 287–304. Springer.
Voshmgir, Shermin. 2017. “Disrupting governance with blockchains and smart contracts.”
Strategic Change, 26(5): 499–509.
Voshmgir, Shermin. 2019a. Token Economy: How Blockchains and Smart Contracts Revo-
lutionize the Economy. Vol. 1, BlockchainHub.
Voshmgir, Shermin. 2019b. What is Token Economy? Vol. 1, O’Reilly Media, Inc.
Walch, Angela. 2015. “New York University Journal of Legislation and Public Policy.” New
York University Journal of Legislation and Public Policy , 18: 837.
Wiener, Norbert. 1965. Cybernetics or Control and Communication in the Animal and the
Machine. Vol. 25, MIT press.
Wolfram, Stephen. 2002. A new kind of science. Vol. 5, Wolfram media Champaign, IL.
Yamamoto, Hitoshi, Isamu Okada, Satoshi Uchida, and Tatsuya Sasaki. 2017. “A
norm knockout method on indirect reciprocity to reveal indispensable norms.” Scientiﬁc re-
ports, 7: 44146.
Zamﬁr, Vlad. 2015. “What is Cryptoeconomics.”
Zargham, Michael, Zixuan Zhang, and Victor Preciado. 2018. “A State-
Space Modeling Framework for Engineering Blockchain-Enabled Economic Systems.”
https://arxiv.org/pdf/1807.00955.pdf:ArXiv.org.
Zhang, Z., M. Zargham, and V. Preciado. 2019. “On Modeling Blockchain-Enabled Eco-
nomic Networks as Stochastic Dynamical Systems.” [Forthcoming]:Springer.

---
