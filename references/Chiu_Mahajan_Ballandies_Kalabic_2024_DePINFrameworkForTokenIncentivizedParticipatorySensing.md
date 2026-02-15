# Chiu_Mahajan_Ballandies_Kalabic_2024_DePINFrameworkForTokenIncentivizedParticipatorySensing.pdf

## Page 1

arXiv:2405.16495v1  [cs.GT]  26 May 2024
DePIN: A Framework for Token-Incentivized
Participatory Sensing
Michael T. C. Chiu Sachit Mahajan Mark C. Ballandies Uroˇ s V . Kalabi´ c
Abstract—There is always demand for integrating data into
microeconomic decision making. Participatory sensing dea ls with
how real-world data may be extracted with stakeholder parti cipa-
tion and resolves a problem of Big Data, which is concerned wi th
monetizing data extracted from individuals without their p artic-
ipation. We present how Decentralized Physical Infrastruc ture
Networks (DePINs) extend participatory sensing. We discus s the
threat models of these networks and how DePIN cryptoeconomi cs
can advance participatory sensing.
I. I NTRODUCTION
The world is interconnected and advancements in infor-
mation and communications technology are readily improv-
ing information transfer between interconnections. The wo rld
economy is complex and improvements in microeconomic
data-sharing are, as a matter of course, leveraged to remove
market inefﬁciency and, for example, improve price discov-
ery or even improve liquidity through more efﬁcient use of
leverage. Economic inefﬁciencies are prone to exploitatio n for
ﬁnancial gain, so there is always demand for real-world data
that can be used to advise microeconomic decisions.
Distributed ledger technology (DLT), and the closely as-
sociated concepts of blockchain and cryptocurrency, allow s
for the democratization of information exchange by enablin g
the establishment of a source of truth, i.e., the ledger, which,
when adequately regulated through the use of incentivizati on
schemes, can closely align the state of the ledger with the
state of affairs reﬂected by whatever part of reality a ledge r
is designed to reﬂect. In this way, a ledger may reﬂect
either physical data, ﬁnancial data, or both; from a technic al
perspective, the speciﬁc type of data is irrelevant. Howeve r,
from the perspective of design, what the data represent is
important, i.e., technical aspects of DLT are of less concern
to data analysts as opposed to what the ledgers themselves
represent and how their contents represent real-world valu e.
The concept of web3 is one of a decentralized World Wide
Web where the transfer of value is governed through the use of
DLT and cryptocurrenices. The preceding concept of web2 is
one where data are typically siloed and the monopsonic prici ng
power held by larger entities is wielded against individual s to
extract value from their data while offering signiﬁcantly l ess
in return. A conceptual outgrowth of web2 has been the advent
of Big Data, but big data is not necessarily good data; when
data collected surpasses processing power available, it re sults
M. T. C. Chiu (michael@wihi.cc) is with WiHi.
S. Mahajan (sachit.mahajan@gess.ethz.ch) is a Lecturer of Computational
Social Science at ETH Zurich.
M. C. Ballandies (mark@wihi.cc) is with WiHi.
U. V . Kalabi´ c (uros@wihi.cc) is with WiHi.
producer
consumer
cryptocurrency data
(a) web2 methodology
producers and
consumers
cryptocurrencies
data
(b) web3 methodology
Fig. 1: Conceptual differences between web2 and web3
in sampling biases [1]. This is where web3 shows greater
promise.
In particular, in web3 it is important to consider incentive
alignment and offer more equitable terms to individuals. Th e
use of cryptocurrencies allows for this because they are
permissionless, borderless and, depending on the DLT used,
cheap. However, using DLT solely for the purpose of value
transfer via cryptocurrency is not on its own an insufﬁcient
use of DLT since DLT can be so much more[2]: No longer
is it necessary to separate ﬁnance from data at the level
of transaction processing. The web3 methodology allows the
possibility of merging data into ﬁnancial processes in more
complex ways that unlock the ability to extract good data
at fair market value. Compare Figures 1a and 1b. The ﬁrst
ﬁgure represents a web2 design methodology, where money, in
this case cryptocurrency, is exchanged for some data betwee n
two entities. The second ﬁgure represents a web3 design
methodology, where both money and data are interlinked in
a complex way and it is more difﬁcult to identify value
ﬂows because an individual entity may be both customer and
provider simultaneously.
This is where the concept of Decentralized Physical In-
frastructure Networks (DePINs) becomes important. DePINs
are a novel way of organizing physical infrastructure [3],
such as the energy grid, that leverages DLT to unlock novel
ways of sourcing data, consuming data and services and
building the overall platform. To expand on the framework
of Figure 1b, we present in Figure 2 a schematic of how
DePINs commonly work: a platform, ideally running on-
chain via smart contracts, serves as both an ingress and
egress point for both cryptocurrencies and data; the data

---

## Page 2

platformproducers consumers
exchange
speculators
maintainers
data data
develop
Fig. 2: Schematic of value transfer within a DePIN ecosystem
(dashed lines represent cryptocurrency ﬂows)
ﬂows from producers to consumers, whereas cryptocurrencie s
ﬂow between producers (who are paid in cryptocurrency and
exchange it for their preferred currency), consumers (who p ay
in cryptocurrency and procure it with their preferred curre ncy),
maintainers (who, like producers, are paid in cryptocurren cy),
and speculators (who perform price discovery). The point he re
is that individuals may, at any point in time, be producer,
consumer, maintainer, speculator, or any combination of th e
foregoing.
More generally, DePINs can be considered a part of the
Internet of Things (IoT) [3], in which extending internet co n-
nectivity to a wide range of physical devices and everyday ob -
jects, enabling them to collect and exchange data and enhanc e
automation, efﬁciency, and data-driven decision-making i n
various domains. An older concept than that of DePIN, relate d
to IoT, is that of participatory sensing [4]. Participatory sensing
recognizes that inexpensive sensing devices, such as smart -
phones with their ubiquity and persistent Internet connect ivity,
may be leveraged to provide valuable real-world insights. F or
example, participatory sensing has been used to monitor air
pollution [5], noise pollution [6], and street illuminatio n levels
[7]; crowd-source bargin-hunting goods [8], the detection of
pot-holes [9], and determination of thermal comfort [10].
However, the data provided by inexpensive sensors is typica lly
of limited value when compared to professional-grade sensi ng
technology. In this sense, participatory sensing does not o ffer
much of a solution to the inadequate-data problem of Big Data ,
described previously.
Despite signiﬁcant advancements in participatory sensing ,
a multitude of challenges remain, particularly in ensuring
high-quality data. These challenges extend beyond technic al
issues like device calibration and sensor drift [11], which
impact accuracy and reliability. They also encompass aspec ts
such as participant motivation, data privacy concerns, and the
management of heterogeneous data sources [12]. Additional ly,
the variability in participant engagement and the potentia l for
biased data collection due to uneven geographic or demo-
graphic representation pose signiﬁcant hurdles. In addres sing
these challenges, the DePIN concept and the broader ﬁeld
of cryptoeconomics are reshaping participatory sensing. T hey
offer frameworks for scaling up these initiatives, ensurin g data
integrity, and providing incentives for participation. Th is shift
towards a more structured and incentivized model enables
participatory sensing to be effectively implemented on a la rger
scale, improving its potential for application and impact.
In this paper, we present how DePIN as a framework,
and cryptoeconomics more generally, reformulate particip atory
sensing so that it becomes applicable at scale. We present
DePIN-related approaches to hardware design, software arc hi-
tecture, and incentivization mechanism that may advance th e
ﬁeld of participatory sensing to reach its full potential.
We begin by dicussing the lack of related work; in the
following section, we describe the technical problems face d by
participatory sensing networks; in the section following t hat,
we describe how DePINs may be used to provide a solution.
A. Related W ork
DePIN is a novel concept undergoing rapid development. As
such, the authors are conﬁdent in remarking that there is no
work directly related to studying the relationship between par-
ticipatory sensing and DePIN. Work that is indirectly relat ed
includes the study of the advantages of token-incentivized
systems over traditional approaches [13] and exploring im-
provements in DePIN architectures that can potentially ena ble
the next level of scalability of DePIN systems [14].
II. C HALLENGES IN PARTICIPATORY SENSING
Participatory sensing often adopts an open and permission-
less approach, enabling widespread and inclusive particip ation.
While this is a key strength of the participatory model, open -
ness also presents unique challenges, especially with rega rds to
incentivizing participation. As participation is open to a ll, any
system of rewards intended to encourage genuine contributi ons
can simultaneously attract malicious actors, whose readin ess
to provide false data scales in proportion to the size of rewa rd.
Until the advent of Bitcoin, a similar problem existed
in money transmission over the Internet, so the Proof-of-
Work (PoW) consensus mechanism [15] was introduced to
enable trustless consensus. However, although PoW provide s
an effective defense against Sybil attacks, it is impractic al to
run it at the level of a sensor. This is because, regardless of
the cost and quality of the sensing technology, PoW will prov e
uneconomical. Furthermore, even in the absence of monetary
rewards, participatory sensing networks may experience Sy bil
attacks[16] and it is therefore necessary that such network s
implement defenses that prevent these. In the following, we
describe the types of defenses that may be implemented.
A. Hardware-Based Defenses
The most common approach to prevent Sybil attacks in
participatory sensing is hardware based, typically requir ing the
use of a Trusted Platform Module (TPM) to guarantee trust

---

## Page 3

in a sensor[17]. A TPM is a tamper resistant chip separate
from a sensing device’s processor with the capability to acc ess
protected memory and registers, generate random numbers,
seal data to system state, and manage and store cryptographi c
keys securely[18]. TPMs enable trust in a system in a number
of ways. For example, TPMs enable measured boot, a boot
protocol in which every layer of the ﬁrmware is “measured”,
typically by hashing the ﬁrmware, before being loaded and
securely stored for later veriﬁcation. TPMs also enable Rem ote
Attestation (RA), a challenge-response protocol between a n
untrusted prover, i.e., a sensor, attempting to prove that it
has determined the state correctly, and a veriﬁer, i.e., the
network, attempting to determine the trustworthiness of th e
untrusted prover [19]. Nevertheless, incorrect usage of TP M
APIs can render TPMs useless and this is not an uncommon
occurrence[20]. Furthermore, although TMPs are becoming
increasingly ubiquitous, being shipped with commonly used
TPM-enabled microcontrollers like the Raspberry Pi[21], r e-
quiring users to install custom software that can access the
TPM can prove difﬁcult for the purposes of both on-boarding
participants, especially in the early stages of network gro wth
where any data source is welcome, and on-boarding hardware
manufacturers, who could be resistant to allow their device s
to be tampered with.
B. Server-Based Quality Assurance
Data received from a sensor running the correct ﬁrmware
is not neccessarily either of quality or trustworthy. Apart
from maliciousness, this may be due to improper sensor
setup or some fault in either hardware, ﬁrmware, or even
the communication channel. Data veriﬁcation in participat ory
sensing systems refers to the problem of ensuring data accu-
racy, removing outliers, data completeness, and consisten cy,
data integrity, and spatial and temporal validation [22]. A p-
proaches include: spatial interpolation[23], inverse dis tance
weighting[24], Kriging[25], deep neural nets (and associa ted
preprocessing algorithm)[26], cross validation[27], uns uper-
vised learning[28], and the use of optimization[29]. These
approaches are based in software run on the server receiving
the data and, in general, these approaches compare sources o f
data between to each other to determine whether data from
particular sensors surpasses some quality threshold.
C. Mechanism Design
The main weakness of participatory sensing is that of
adequately incentivizing participants. Conventional gam e-
theoretic analysis in the context of participatory sensing , such
as framing the problem as a Stackleberg game or reverse
auction where the user who bids with the least reward obtain
rights to participate in a sensing task [30], has shown that
ﬁnancial incentives are effective at incentivizing partic ipants
to perform tasks in proportion to the quantity of data shared
[31]. Somewhat remarkably, it has also been shown that ﬁat-
based ﬁnancial incentives, such as the use of micro-payment s,
have resulted in participants losing focus a short while aft er
taking up tasks [32] and that the impact on quality of shared i n-
formation may be negative [33] since intrinsic motivation c an
be crowded out through the use of ﬁat-based incentives[34]. A
focus on long-term incentivization, however, increases so cial
welfare [35] but a further downside to pure ﬁnanical incenti ve
mechanisms, besides the crowding out of intrinsic motivati on,
is that it requires the use of actual money, which can result b e
costly for the network operator.
For these reasons, alternatives to ﬁnancial incentivizati on
have been explored, including gamiﬁcation [36], reputatio n
[37], [38], and intrinsic motivation [31] mechanisms.
III. D EPIN: A F RAMEWORK FOR TOKEN -I NCENTIVIZED
PARTICIPATORY SENSING
Decentralized Physical Infrastructure Networks (DePINs)
use cryptoeconomics such as token-incentives, decentrali zed
governance, and distributed ledger technology to solve man y
of the same challenges faced by participatory sensing netwo rks
and, as such, enable their scaling. While still in its infanc y,
DePINs can be deﬁned as decentralized networks that utilize
cryptoeconomics to incentivize participants to build phys ical
infrastructure or procure resources that stem from a physic al
asset. Two widely accepted examples of DePIN networks are:
Helium and Filecoin.
DePINs have all the elements of a participatory sensing
network: participants, on a large-scale, contribute to the func-
tioning of the network by providing resources. An improve-
ment over participatory sensing networks, however, is that
incentivization, in one form or another, is tied to the netwo rk
token: the monumental success of DePINs such as Helium
and Filecoin are a testament to this. The network token
enables tokenomics and other game-theoretic mechanisms to
not only incentivize participation but to also disincentiv ize
malicious behavior. For this reason, DePINs should be seen
as a framework for token-incentivized participatory sensi ng.
In the following, we begin by introducing the threat model
of DePIN, and then present how cryptoeconomic mechanisms
may be used to mitigate these threats. In particular, we
make the case that cryptoeconomic mechanisms can be a
robust approach to disincentivize participants from carry ing
out attacks on the network.
A. Threat Model and Sensor Node Security
Determining trustworthiness of contributed data is import ant
for both participatory sensing networks as well as DePINs.
In the case of the latter, the fact that nodes are incentivize d
for long-term participation implies that they have a higher in-
centive to act maliciously. Morevover, discouraging indiv idual
nodes from providing malicious data is challenging because
it is non-trivial to determine the relationship between qua lity
of the received data stream and potential reward. The need to
prevent malicious behavior is not restricted to open-hardw are
use cases since, although restricting the speciﬁc hardware that
may register on the network may help with preventing Sybil
attacks, the fact remains that a malicious participant may

---

## Page 4

tamper with the environment itself to provide a false, i.e., more
beneﬁcial to the participant, sensor reading.
In the following, we describe threats on a per-node basis.
We begin by deﬁning a DePIN sensor node and, by extension,
participatory sensing node.
Sensor Node.: A sensor node within a DePIN (resp.
participatory sensing network) is a physical hardware devi ce
having the following components:
1) a processing unit (CPU)
2) writeable memory storage unit (RAM)
3) non-writeable memory (ROM)
4) sensing (measurements) peripherals
This deﬁnition of sensors allows for a broad range of hardwar e,
ranging from microcontroller-like devices with low comput a-
tional capabilities to more powerful Raspberry Pis, wherei n,
in both cases, the peripherals provide sensing or measureme nt
capabilities. There are three main type of threats that sens or
nodes face.
1) Device Threats: Device-level threats include both hard-
ware and software threats. Hardware threats are more com-
monly known as ﬁrmware-level threats since ﬁrmware is the
crucial low-level piece of software that is responsible for
booting a device or communicating with peripherals (driver s).
It is almost impossible to completely defend against ﬁrmwar e
threats during runtime [39] but this concern can be greatly
alleviated by strengthening a chain-of-trust [40]. Softwa re
threats are the more traditional and well-known type of atta cks
that occur during runtime [41]. In general, software-level
threats are addressed by some form of “Remote Attestation”.
However, attestation for less powerful devices such as sens ors
are not ideal as they require more power [42] or that the senso r
be brieﬂy paused [43]. We note that, as with all electronics,
physical access to hardware can bypass all ﬁrmware and
software protections [44]. Hardware approaches to ensurin g
sensor node security either reduce the potential size of the
network, by requiring additional functionality such as, fo r
example, trusted hardware, or are not sufﬁcient on their own
to address the threats that a DePIN sensor network face.
2) Network Threats: Sensors communicate with the broader
network over the Internet via APIs. A malicious actor can
bypass an actual physical device by emulation and falsify
measurements directly to the network via the API boundary
[45]. Note that closed-hardware solutions do not adequatel y
address this class of threats since they greatly reduce the
potential size of the network.
3) Sensor Environment Threats: An important class of
threats unique to decentralized sensor networks, whether c las-
sical participatory sensing networks or DePIN sensor net-
works, are attacks where the malicious participant alters t he
physical environment of the sensor node or introduces an
artiﬁcial element in the sensor node’s physical environmen t.
For example, a malicious actor can place a sensor at a sub-
optimal location for measurement in order to record data
that might be viewed as and thus valuable by the network.
Similarly, a malicious actor can artiﬁcially create or modi fy
the sensor environment to achieve the same effect. Sensor
environment threats are, arguably, the main threats to DePI Ns
without an adequate way to address this type of threat.
B. Cryptoeconomic Mechanisms
Cryptoeconomics is utilized by DePINs to mitigate the
threats described above and challenges of participatory se ns-
ing. Cryptoeconomics consists of, amongst other things, to ke-
nomics, governance and DLT [46].
1) T okenomics:
a) T okens: Monetary incentives are effective in promot-
ing active and substantial participation in both participa tory
sensing [31] and DePINs [47]. The key distinction lies in
the reward types: DePINs use network-speciﬁc tokens as
incentives, whereas traditional participatory sensor net works,
if they offer incentives at all, typically provide cash or
non-exchangeable rewards like point systems. In contrast t o
monetary incentives, token-based incentives allow for des igns
that increase the intrinsic motivation of network particip ants
to contribute in quality as well as quantity, a major limita-
tion of ﬁat-only approaches being that they often crowd out
intrinsic motivation [48]. For instance, token incentives can
represent ownership or reputation, potential drivers of in trinsic
motivation [49]. For this, a token can be constructed from a
large design space [3]: System designers can deﬁne how a
token may i) be burned, removing units from circulation; ii)
be transferred; iii) be capped in supply, iv) be premined, v)
be limited in fungibility, vi) have a source of value; and vii )
have a creation mechanism bound to concrete actions, e.g., the
sharing of sensor data.
Moreover, token-based rewards shift future earnings to the
present, offering immediate ﬁnancing for DePIN systems. Th is
incentivizes participation, overcomes budget constraint s and
enables the creation of networks that might not be feasible
without such incentives [47]. Thus, DePINs can bootstrap
more effectively than traditional, non-incentivized netw ork
development.
b) Multi-T oken Models: The ﬂexibility of token-based
approaches allows a system designer to deploy more than one
token and in this way span a multi-dimensional incentivizat ion
space that can result in an improved calibration and thus
resilience of a cryptoeconomic system [2]. The most prevale nt
multi-dimensional incentivization approach in DePINs is t he
burn-and-mint model, which effectively aligns the token’s
value with the network’s service value [50]. This dual-toke n
system consists of a ’value’ token, created from nothing to
reward nodes for their services, and a ’utility’ token, with a
ﬁxed ﬁat value for buying services. The value token is traded
openly, while the utility token is acquired by destroying an
equivalent amount of the value token. Often the dimension of
these token models are increased over a systems lifetime, as
it is for instance observed in Helium.
c) Game Theory: On top of these token models, sev-
eral game-theoretical mechanism can been applied to provid e
further incentives to contribute in terms of quantity and mo re
importantly in quality to a DePIN system, such as staking [51 ],
vesting [52], or bonding curves [53].

---

## Page 5

d) Participatory Governance: DePINs can scale to large
interdependent networks of a diverse set of stakeholders. T hese
techno-socio-economic networks are complex systems [46]
where traditional governance and control mechanisms often
fail, such as in the case of sustainability and resilience [5 4].
Hence, bottom-up, decentralized mechanisms are increasin gly
used to navigate these complex systems and have been shown
to control and calibrate them more effectively [55]. An
expression of this trend is the emergence of decentralized
autonomous organizations (DAOs) that combine collective
intelligence, digital democracy and self-organization [5 5] to
navigate complex blockchain systems. DAOs comprise two
main elements: the community and the organization [56]. The
community consists of individuals united by relationships and
a common identity, each with their own goals like investment
returns or enjoyable experiences. A DAO forms when these
members collaborate to fulﬁll a shared vision that aligns
with their personal aims. This structure offers a sense of
belonging and purpose, addressing this key shortcoming of
earlier participatory sensing campaigns [57]. The governa nce
of DePIN networks is often centralized [3], which can result
in rent extraction or hold-up problems [58] and generally
undermine the decentralization of a DePIN.
2) Distributed Ledger T echnology: Several concepts from
DLT can be potentially be utilized in DePIN to mitigate the
illustrated challenges. For example, a useful work type of
consensus algorithm, as utilized for instance in Filecoin, can
prevent Sybil attacks and can guarantee quality of service,
e.g. trustworthy sensor data. Nevertheless, no generaliza ble
solution to date has been found for DePIN networks. Fur-
thermore, security and privacy are major concerns in partic -
ipatory sensing [59] which can be mitigated by using DLT
[60], e.g. the immutable storage or zero-knowledge proofs.
Finally, decentralized identities could facilitate bette r control
of DePIN contributors about their data, another limitation of
participatory sensing [59].
IV. C ONCLUSION
There is always demand for integrating data into ﬁnancial
decision making. Large data sets are valuable but when the
origins of data are spread across many stakeholders, the dat a
becomes difﬁcult to extract. The ﬁeld of participatory sens ing
is concerned with ﬁnding ways to share and extract such data.
In this paper, we showed that cryptoeconomics applied,
through the framework of DePIN, holds great promise for
tackling the challenges of low participation and insufﬁcie nt
data quality in participatory sensing networks. We demon-
strated the next stage in participatory sensing, proposing
directions on how the ﬁeld may be improved through the
integration of cryptoeconomic mechanisms through the use o f
Decentralized Physical Infrastructure Networks (DePINs) . We
presented threats faced by participatory sensing networks as
well as DePINs, and how these threats may be addressed.
REFERENCES
[1] Helbing, D. Thinking ahead-essays on big data, digital revolution, and
participatory market society 10. Springer (2015).
[2] Dapp, M. M., Helbing, D., Klauser, S. Finance 4.0-Towards a Socio-
Ecological Finance System: A Participatory Framework to Pr omote
Sustainability. Springer Nature (2021).
[3] Ballandies, M. C., Wang, H., Law, A. C. C., Y ang, J. C., G¨ o sken, C.,
Andrew, M. “A Taxonomy for Blockchain-based Decentralized Physical
Infrastructure Networks (DePIN).” arXiv preprint arXiv:2309.16707 .
[4] Burke, J. A., et al. “Participatory Sensing.” .
[5] M´ endez, D., P´ erez, A. J., Labrador, M. A., Marr´ on, J. J . “P-Sense: A
participatory sensing system for air pollution monitoring and control.”
In 2011 IEEE International Conference on Pervasive Computing and
Communications W orkshops (PERCOM W orkshops) 344–347 (2011)
doi:10.1109/PERCOMW.2011.5766902.
[6] Schweizer, I., B¨ artl, R., Schulz, A., Probst, F., M¨ uhl ¨ auser, M.
“NoiseMap-real-time participatory noise maps.” In Second international
workshop on sensing applications on mobile phones Citeseer 1–5 (2011)
.
[7] Middya, A. I., Roy, S., Chattopadhyay, D. “CityLightSen se: a participa-
tory sensing-based system for monitoring and mapping of ill umination
levels.” ACM Transactions on Spatial Algorithms and Systems (TSAS)
8.1 1–22 (2021).
[8] Deng, L., Cox, L. P . “Livecompare: grocery bargain hunti ng through
participatory sensing.” In Proceedings of the 10th workshop on Mobile
Computing Systems and Applications 1–6 (2009) .
[9] Patra, S., Middya, A. I., Roy, S. “PotSpot: Participator y sensing based
monitoring system for pothole detection using deep learnin g.” Multime-
dia Tools and Applications 80 25171–25195 (2021).
[10] Erickson, V . L., Cerpa, A. E. “Thermovote: participato ry sensing for
efﬁcient building hvac conditioning.” In Proceedings of the F ourth
ACM W orkshop on Embedded Sensing Systems for Energy-Efﬁcie ncy
in Buildings 9–16 (2012) .
[11] Can, A., Guillaume, G., Picaut, J. “Cross-calibration of participatory
sensor networks for environmental noise mapping.” Applied Acoustics
110 99–109 (2016).
[12] Mahajan, S., Mondardini, R., Helbing, D. “Democratizi ng Air: A Co-
Created Citizen Science Approach to Indoor Air Quality Moni toring.”
Available at SSRN 4594515 .
[13] Malinova, K., Park, A. “Tokenomics: When Tokens Beat Eq uity.”
Management Science 69.11 6568–6583 (2023).
[14] Fan, X., Xu, L. “Towards a Rollup-Centric Scalable Arch itecture for
Decentralized Physical Infrastructure Networks: A Positi on Paper.” In
Proceedings of the Fifth ACM International W orkshop on Bloc kchain-
enabled Networked Sensor Systems 9–12 (2023) .
[15] Nakamoto, S. “Bitcoin: A peer-to-peer electronic cash system.” Decen-
tralized business review .
[16] V erchok, N., Orailo˘ glu, A. “Hunting Sybils in Partici patory Mobile
Consensus-Based Networks.” In Proceedings of the 15th ACM Asia
Conference on Computer and Communications Security 732–743 (2020)
.
[17] Saroiu, S., Wolman, A. “I am a sensor, and i approve this m essage.” In
Proceedings of the Eleventh W orkshop on Mobile Computing Sy stems
& Applications 37–42 (2010) .
[18] Ezirim, K., Khoo, W., Koumantaris, G., Law, R., Perera, I. M. “Trusted
Platform Module–A Survey.” The Graduate Center of The City Univer-
sity of New York 11.
[19] Banks, A. S., Kisiel, M., Korsholm, P . “Remote attestat ion: a literature
review.” arXiv preprint arXiv:2105.02466 .
[20] Wan, S., Sun, M., Sun, K., Zhang, N., He, X. “RusTEE: Deve loping
Memory-Safe ARM TrustZone Applications.” In Annual Computer
Security Applications Conference New Y ork, NY , USA: Association for
Computing Machinery 442–453 (2020) doi:10.1145/3427228. 3427262
URL https://doi.org/10.1145/3427228.3427262.
[21] Pinto, S., Araujo, H., Oliveira, D., Martins, J., Tavar es, A. “Virtualization
on trustzone-enabled microcontrollers? voil` a!” In 2019 IEEE Real-Time
and Embedded Technology and Applications Symposium (RTAS) IEEE
293–304 (2019) .
[22] Chen, L.-J., Ho, Y .-H., Hsieh, H.-H., Huang, S.-T., Lee , H.-C., Mahajan,
S. “ADF: An Anomaly Detection Framework for Large-Scale PM2 .5
Sensing Systems.” IEEE Internet of Things Journal 5.2 559–570 (2018)
doi:10.1109/JIOT.2017.2766085.
[23] Middya, A. I., Roy, S. “Spatial interpolation techniqu es on participatory
sensing data.” ACM Transactions on Spatial Algorithms and Systems 7.3
1–32 (2021).
[24] Bilonick, R. A. “An introduction to applied geostatist ics.” (1991).

---

## Page 6

[25] Aumond, P ., et al. “Kriging-based spatial interpolation from measure-
ments for sound level mapping in urban areas.” The journal of the
acoustical society of America 143.5 2847–2857 (2018).
[26] Chang, Q., Tao, D., Wang, J., Gao, R. “Deep Compressed Se nsing
based Data Imputation for Urban Environmental Monitoring. ” ACM
Transactions on Sensor Networks 20.1 1–21 (2023).
[27] Luo, T., Huang, J., Kanhere, S. S., Zhang, J., Das, S. K. “ Improving IoT
Data Quality in Mobile Crowd Sensing: A Cross V alidation App roach.”
IEEE Internet of Things Journal 6.3 5651–5664 (2019) doi:10.1109/
JIOT.2019.2904704.
[28] Banerjee, N., Giannetsos, T., Panaousis, E., Took, C. C . “Unsupervised
Learning for Trustworthy IoT.” In 2018 IEEE International Conference
on Fuzzy Systems (FUZZ-IEEE) 1–8 (2018) doi:10.1109/FUZZ-IEEE.
2018.8491672.
[29] Restuccia, F., Ferraro, P ., Sanders, T. S., Silvestri, S., Das, S. K., Re,
G. L. “FIRST: A framework for optimizing information qualit y in mobile
crowdsensing systems.” ACM Transactions on Sensor Networks (TOSN)
15.1 1–35 (2018).
[30] Y ang, D., Xue, G., Fang, X., Tang, J. “Crowdsourcing to S mart-
phones: Incentive Mechanism Design for Mobile Phone Sensin g.” In
Proceedings of the 18th Annual International Conference on Mobile
Computing and Networking New Y ork, NY , USA: Association for
Computing Machinery 173–184 (2012) doi:10.1145/2348543. 2348567
URL https://doi.org/10.1145/2348543.2348567.
[31] Christin, D., B¨ uchner, C., Leibecke, N. “What’s the va lue of your
privacy? Exploring factors that inﬂuence privacy-sensiti ve contributions
to participatory sensing applications.” In 38th Annual IEEE Conference
on Local Computer Networks-W orkshops IEEE 918–923 (2013) .
[32] Reddy, S., Estrin, D., Hansen, M., Srivastava, M. “Exam ining
Micro-Payments for Participatory Sensing Data Collection s.” In Pro-
ceedings of the 12th ACM International Conference on Ubiqui -
tous Computing New Y ork, NY , USA: Association for Comput-
ing Machinery 33–36 (2010) doi:10.1145/1864349.1864355 U RL
https://doi.org/10.1145/1864349.1864355.
[33] Ballandies, M. C. “To incentivize or not: Impact of bloc kchain-based
cryptoeconomic tokens on human information sharing behavi or.” IEEE
Access 10 74111–74130 (2022).
[34] Osterloh, M., Frey, B. S. “Motivation, knowledge trans fer, and organi-
zational forms.” Organization science 11.5 538–550 (2000).
[35] Gao, L., Hou, F., Huang, J. “Providing long-term partic ipation incentive
in participatory sensing.” In 2015 IEEE Conference on Computer Com-
munications (INFOCOM) 2803–2811 (2015) doi:10.1109/INFOCOM.
2015.7218673.
[36] Ueyama, Y ., Tamai, M., Arakawa, Y ., Y asumoto, K. “Gamiﬁ cation-
based incentive mechanism for participatory sensing.” In 2014 IEEE
International Conference on Pervasive Computing and Commu nication
W orkshops (PERCOM WORKSHOPS) IEEE 98–103 (2014) .
[37] Y u, R., Cao, J., Liu, R., Gao, W., Wang, X., Liang, J. “Par ticipant
incentive mechanism toward quality-oriented sensing: und erstanding and
application.” ACM Transactions on Sensor Networks (TOSN) 15.2 1–25
(2019).
[38] Huang, K. L., Kanhere, S. S., Hu, W. “Are you contributin g trustworthy
data? The case for a reputation system in participatory sens ing.” In
Proceedings of the 13th ACM international conference on Mod eling,
analysis, and simulation of wireless and mobile systems 14–22 (2010) .
[39] Shah, Y ., Sengupta, S. “A survey on Classiﬁcation of Cyb er-attacks on
IoT and IIoT devices.” In 2020 11th IEEE Annual Ubiquitous Com-
puting, Electronics & Mobile Communication Conference (UE MCON)
IEEE 0406–0413 (2020) .
[40] Zimmer, V ., Krau, M. “Establishing the root of trust.” UEFI. org
document dated August .
[41] Or-Meir, O., Nissim, N., Elovici, Y ., Rokach, L. “Dynam ic malware
analysis in the modern era—A state of the art survey.” ACM Computing
Surveys (CSUR) 52.5 1–48 (2019).
[42] Ammar, M., Crispo, B., Tsudik, G. “Simple: A remote atte station
approach for resource-constrained iot devices.” In 2020 ACM/IEEE 11th
International Conference on Cyber-Physical Systems (ICCP S) IEEE
247–258 (2020) .
[43] Dushku, E., Rabbani, M. M., Conti, M., Mancini, L. V ., Ra nise, S.
“SARA: Secure asynchronous remote attestation for IoT syst ems.” IEEE
Transactions on Information F orensics and Security 15 3123–3136
(2020).
[44] Fu, K., Xu, W. “Risks of Trusting the Physics of Sensors. ”
Commun. ACM 61.2 20–23 (2018) doi:10.1145/3176402 URL
https://doi.org/10.1145/3176402 .
[45] Wang, G., Wang, B., Wang, T., Nika, A., Zheng, H., Zhao, B . Y .
“Ghost riders: Sybil attacks on crowdsourced mobile mappin g services.”
IEEE/ACM transactions on networking 26.3 1123–1136 (2018).
[46] V oshmgir, S., Zargham, M., et al. “Foundations of cryptoeconomic
systems.” Research Institute for Cryptoeconomics, Vienna, W orking
Paper Series/Institute for Cryptoeconomics/Interdisciplinary Research 1.
[47] Jagtap, D., Y en, A., Wu, H., Schulman, A., Pannuto, P . “F ederated in-
frastructure: usage, patterns, and insights from” the peop le’s network”.”
In Proceedings of the 21st ACM Internet Measurement Conferenc e 22–
36 (2021) .
[48] Ballandies, M. C. “To incentivize or not: Impact of bloc kchain-based
cryptoeconomic tokens on human information sharing behavi or.” IEEE
Access 10 74111–74130 (2022).
[49] Kuwabara, K. “Do reputation systems undermine trust? D ivergent effects
of enforcement type on generalized trust and trustworthine ss.” American
Journal of Sociology 120.5 1390–1428 (2015).
[50] Kalabic, U., Ballandies, M. C., Paruch, K., Nax, H., Nig g, T. “Burn-and-
Mint Tokenomics: Deﬂation and Strategic Incentives.” In Int. W orkshop
Decentralized Physical Infrastructure Networks, page sub mitted for
publication (2023) .
[51] Kraner, B., V allarano, N., Schwarz-Schilling, C., Tes sone, C. J. “Agent-
Based Modelling of Ethereum Consensus.” In 2023 IEEE International
Conference on Blockchain and Cryptocurrency (ICBC) IEEE 1–8 (2023)
.
[52] Sch¨ ar, F. “Decentralized ﬁnance: On blockchain-and s mart contract-
based ﬁnancial markets.” FRB of St. Louis Review .
[53] Zargham, M., Shorish, J., Paruch, K. “From curved bondi ng to conﬁg-
uration spaces.” In 2020 IEEE International Conference on Blockchain
and Cryptocurrency (ICBC) IEEE 1–3 (2020) .
[54] Helbing, D., Helbing, D. “Networked Minds: Where Human Evolution
Is Heading.” Next Civilization: Digital Democracy and Socio-Ecologica l
Finance-How to Avoid Dystopia and Upgrade Society by Digita l Means
175–196.
[55] Helbing, D., et al. “Democracy by Design: Perspectives for Digitally
Assisted, Participatory Upgrades of Society.” Journal of Computational
Science 71 102061 (2023).
[56] van der Molen, T., Ospina, D. “What is a DAO Community
and when is it healthy: a working paper by RnDAO.” (2023) URL
https://rndao.mirror.xyz/F-SMj6p
jdYvrMMkR1d9Hd6YbEg39qItTKfjo-zkgqM.
[57] Balestrini, M., Diez, T., Kresin, F. “From participato ry sensing to
making sense.” Environ. Infrastructures Platforms 2015-Infrastructure s
Platforms Environ. Crowd Sens. Big Data 49–56.
[58] Goldberg, M., Sch¨ ar, F. “Metaverse governance: An emp irical analysis
of voting within Decentralized Autonomous Organizations. ” Journal of
Business Research 160 113764 (2023).
[59] Karim, A., et al. “Big data management in participatory sensing: Issues,
trends and future directions.” Future Generation Computer Systems 107
942–955 (2020).
[60] Cheng, J., Long, H., Tang, X., Li, J., Chen, M., Xiong, N. “A reputation
incentive mechanism of crowd sensing system based on blockc hain.” In
Artiﬁcial Intelligence and Security: 6th International Co nference, ICAIS
2020, Hohhot, China, July 17–20, 2020, Proceedings, Part II 6 Springer
695–706 (2020) .

---

## Page 7

This figure "notaglinelogo.png" is available in "png"
 format from:
http://arxiv.org/ps/2405.16495v1

---
