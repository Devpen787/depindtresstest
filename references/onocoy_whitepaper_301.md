# onocoy_whitepaper_301.pdf

## Page 1

ONOCOY : E NABLING MASS ADOPTION OF HIGH PRECISION
GNSS POSITIONING USING WEB 3
WHITE PAPER
REVISION 3.0.1
onocoy Association
info@onocoy.com
July 7, 2025
ABSTRACT
While Global Navigation Satellite System (GNSS) technology has become omnipresent in consumer,
automotive, and industrial applications, the adoption of high precision GNSS technology continues
to be inaccessible to the mass market due to the lack of a global, dense and optimally distributed
GNSS infrastructure network facilitating improvements of positioning to the sub-centimeter level.
Such a network would represent the basis to serve an existing market of C6.7B and facilitate
novel applications benefiting humanity such as early tsunami warning systems, crustal deformation
monitoring and space weather monitoring, on a larger and more accurate scale than previously
possible.
onocoy incentivizes the transparent construction of such a network in a decentralized way with
blockchain-based tokens, open standards and hardware that includes all stakeholders of the ecosystem
including existing competing actors and users of their services. In this way, community-powered
and decentralized GNSS infrastructure as a commons is created that benefits everyone by fostering
accessibility, collaboration, and innovation.
Keywords GNSS · Blockchain · DePIN · RTK · web3
1 Introduction
Global Navigation Satellite System (GNSS) technologies use satellite constellations, orbiting Earth, to provide position,
navigation, and timing (PNT) information to users on the Earth’s surface and in its immediate vicinity. GNSS enables
users to determine their location, velocity, and time by the trilateration of signals from multiple satellites. The first and
most well-known GNSS is the Global Positioning System (GPS), developed and operated by the United States. Other
constellations include the Russian GLONASS, Chinese BeiDou, and European Galileo; besides these, there are some
regional navigation satellite systems such as the Japanese QZSS and the Indian NavIC, designed to provide improved
PNT over their respective regions.
GNSS has a wide range of applications which are growing beyond its use in positioning and navigation for users at the
Earth’s surface, which is well-understood by retail consumers, it is also used in determining the position of both aircraft
and spacecraft. The use of GNSS is fundamental for determining geolocation in critical situations such as emergency
and disaster responses, and search-and-rescue operations, where other methods of positioning can be inadequate: GNSS
is necessary when trying to achieve highly accurate, real-time positioning. The importance of its use in timing is
less recognized by the general public. GNSS is important in determining precise times for financial transactions and
telecommunications, and synchronization of scientific experiments and network infrastructure. In its relatively short
history, GNSS has become an essential technology in many aspects of modern life.
The following paragraph introduces the different approaches used, and performances achievable, when providing
positioning services using GNSS. Single Point Positioning (SPP) is the basic positioning principle used with GNSS. It
estimates the user’s coordinates and clock error through a trilateration of the satellites’ position and signal. At meter-
level accuracy, the precision of SPP is good enough for many use-cases, but it is limited; various sources of error, such as

---

## Page 2

onocoy: Enabling mass adoption of high precision GNSS positioning using web3 REVISION 3.0.1
Rover receiver
(e.g. robot, UAV)
Figure 1: A geographically close GNSS reference receiver is fundamental to improving the positioning accuracy of a
rover receiver from a meter to a (sub)centimeter accuracy.
satellite orbit errors, atmospheric effects, and multipath, i.e. the appearance of multiple signals caused by reflection off
surfaces, all contribute to deterioration of precision [Teunissen and Montenbruck, 2017]. For applications that require
higher accuracy and precision, High-Precision Positioning techniques like Real-Time Kinematic (RTK) corrections and
Precise Point Positioning (PPP) are required. These systems are capable of achieving centimeter to millimeter-level
positioning accuracy by primarily mitigating atmospheric effects and resolving carrier-phase ambiguities. Applications
of high-precision positioning include surveying and mapping, precision agriculture, construction, and geodesy. High-
precision GNSS is also used in monitoring of the Earth’s vibrations and movements, allowing for the measurement
of the movement of tectonic plates, monitoring of the melting of glaciers, and development of early tsunami and
earthquake warning systems.
While some of the benefits above can be realized with the use of either RTK or PPP, only RTK is able to deliver
instantaneous centimeter-level positioning in real-time. The convergence time to centimeter-level accuracy with PPP
is primarily due to the estimation of the residual atmospheric errors, which typically takes tens of minutes. RTK,
however, relies on a ground-based Continuously Operated Reference Station (CORS) that provides the observed GNSS
measurements. Assuming the CORS is within 20km by differencing the measurements between the rover and CORS,
all major error sources are eliminated, in contrast to PPP where the unmodelled errors are mitigated through estimation.
RTK enables high-precision positioning for objects in motion, as shown in Fig. 1.
With the benefits of RTK having been made clear, what prevents its global realization is a combination of factors:
high costs, redundancies, and proprietary standards all play a role. While one may install a CORS to cover an area of
interest, the coverage will be limited to a local area. The alternative is then to build a network of reference stations, but
the conventional build-out of such a network results in high investment and maintenance costs and gaps in coverage,
since central entities focus on only the most profitable areas of coverage. The result is a patchwork of networks and
disorganized single-station owners: increased costs, and redundant and patchy coverage. The desired solution is one
in which the local model can be scaled globally, so that coverage can be delivered to any region where it might be
economical and redundancies may be limited to the amount needed for robustness. Such a network would result in
lowered costs and increased performance.
We at onocoy have created the solution to these problems described above by implementing a GNSS reference station
infrastructure that is decentralized and efficient. The enabling technologies are those of web3, which is a collection of
technologies that incorporate the World Wide Web, distributed ledger technologies, and tokenized economics to enable
new kinds of decentralized economies. In particular, ours is a decentralized physical infrastructure (DePIN) project1,
i.e., a web3 project aimed at networked physical infrastructure.
1For an overview of decentralized physical infrastructure networks (DePINs), see Kassab [2023].
2

---

## Page 3

onocoy: Enabling mass adoption of high precision GNSS positioning using web3 REVISION 3.0.1
In the onocoy network, any operator of a CORS is able to stream its correction data to the onocoy platform in exchange
for tokens which give access to governance in the system. The token is therefore a form of equity that empowers its
holders, and reference station operators in particular, to behave as owners and stewards of the onocoy network.
Beyond using tokens, the onocoy network implements other tools that continue to enable decentralization, the most
important being open standards; onocoy does not require proprietary standards. RTK technology has existed for
decades and has an established practice around its use. onocoy has taken a conscious step to support the existing RTK
infrastructure so that we may complement the existing ecosystem. With this comes a challenge: since standards are
open, one has to differentiate between real and fake data; since the network monetarily incentivizes data collection,
there is an incentive for prevarication of data. This implies that the network must check the validity of incoming data
before determining a reward. Fortunately, and in contrast to other DePIN application contexts [Chiu et al., 2024],
such checks are possible due to the physical nature of the data; there are multiple techniques to verify GNSS data,
relying on detecting anomalies within data streams that deviate from our understanding of physics and statistical
behavior. In a sense, the onocoy validation scheme provides a non-cryptographic likelihood estimate of physical work
having been done. Compared to other projects in web3, this is quite novel, as most web3 projects focus on definitive
cryptographic proofs, such as those obtained in Bitcoin’s proof-of-work scheme. Since onocoy relies on open standards,
and cryptographic protocols are not standard within GNSS, this is not possible to implement.
Nevertheless, what is possible is the implementation of all mechanisms described above as decentralized schemes. In the
onocoy network, tokens are held within users’ wallets, i.e., they are associated with a public cryptographic key whose
private keypair is held by an individual user and not accessible by the network. Validation is done by decentralized
validators; these are validation schemes implemented in combination with smart contracts, or code running on the
blockchain, so that the network may provide trust in its functioning.
The current status of onocoy is an early product rollout on the Solana blockchain mainnet. In this stage, data is provided
to paying customers, and reference station owners earn test tokens that may or may not be converted to the actual token
at launch. Other aspects of onocoy, such as the decentralization of validators remain off-chain.
The rest of the white paper is structured as follows: onocoy’s unique positioning in the GNSS market is illustrated in
Section 2. The cryptoeconomic design facilitating an efficient and resilient co-operation of stakeholders within the
onocoy network is then given in Section 3. This is followed by introducing onocoy’s IT architecture and its approach to
validating the correctness of GNSS measurement streams in Section 4. Finally, a summary and call for action is given
in Section 5.
2 onocoy’s unique positioning – a GNSS market perspective
In this section, we show how onocoy has positioned itself to create and leverage synergies within the GNSS ecosystem.
In Section 2.1, we present the existing GNSS market and its challenges with regards to creating a global and dense
network of CORSs. In Section 2.2, we then illustrate how onocoy overcomes these challenges with its unique
positioning as a community-owned and shared infrastructure. In Section 2.3, we conclude how this ultimately enables
novel applications in the service of humanity.
2.1 Existing GNSS market and its challenges
The biggest markets for real-time high-precision are currently those of machine control, agriculture and logistics.
Growth is driven primarily by automation and autonomous vehicles, e.g., last-mile geofenced transportation/ delivery
services, and is expected to result in a total available GNSS market of C43B in 2028 with a 7% CAGR [EUSPA,
2022]. The market is served by about 20 companies; these are correction service providers that operate CORS,
compute correction data, process the data and provide highly-precise positioning to their customers. For this, they
rely on a subscription-based business model, charging between $200 and $50,000 per year per device. Besides
these commercially operating reference station networks, there are free and open networks such as those operated by
universities or governments, typically providing coarser coverage and lower-quality data.
The high costs associated with building and maintaining dense CORS networks have limited their adoption to regions
with a sufficiently large and affluent customer base – predominantly dense urban areas and regions with highly
automated, large-scale agriculture. Markets outside of these regions, particularly in emerging and developing countries,
continue to be under-served and, as such, there does not exist a global, high-density CORS network. Moreover, in
regions where sufficient network infrastructure exists to the point of redundancy, the redundancy is not leveraged to the
benefit of providers, such as providing backup if one station goes down, and thus does not increase the resilience of the
infrastructure.
3

---

## Page 4

onocoy: Enabling mass adoption of high precision GNSS positioning using web3 REVISION 3.0.1
Figure 2: onocoy’s three-sided market that enables users
to receive validated reference data from station operators
Installed Base of 
Reference Station
Reference Station Makers
End Customers
Sys. Operators
OEMs 
GNSS Device Makers
Correction Service
Providers
Vertically integrated service providers
Figure 3: Service providers are vertically integrated, result-
ing in high reference station infrastructure costs.
CORS networks need to be regularly updated with new hardware as new signals and constellations become available
but much of existing infrastructure gets outdated due to the investments required. Typically, network growth is slowed
down because building up a dense global service is costly. Simultaneously, revenues are only realized once it is fully
deployed, making it difficult for service operators to roll out dense networks quickly and globally.
Even where sufficient coverage and quality is available, infrastructure is often inadequately exploited. Commercial
reference station networks rely on proprietary solutions and communication protocols, restricting their use to specific
niches and limiting interoperability across vendors. Due to this fragmentation in this segment, the the number of
customers served is limited, hence service costs of each vendor remains high.
For instance, correction service providers utilize business models made for high-end niche markets (e.g., oil tankers)
and typically do not pursue a fit with mass markets (e.g., autos): Correction services are often bundled with receivers
(see Figure 3), making it hard for users to select the best receiver and the optimal service for their application. It also
creates an undesired lock-in with vendors’ offerings. Additionally, providers often impose use-case limitations on their
customers. This regionally-fragmented correction service landscape makes selling products globally a challenge for
hardware producers (OEMs as well as tier 1 and 2) and service operators.
As a result, GNSS correction service costs have not fallen at the same rate as the cost of the required hardware. This
impacts the entire industry, with limited adoption of high precision GNSS technology in many mass market applications
holding back sales and depriving end-users and entire economies and regions of the technology’s benefits.
2.2 onocoys unique positioning – benefiting all stakeholders
To overcome the challenges described above, onocoy positions itself as a three-sided platform (Figure 2) following
Gomes Jr. [2022] between station operators, data users (clients), and data validation and provisioning. Using open
standards and protocols (i.e. NTRIP RTCM3 MSM), data is received from reference stations and relayed to users via
validators that continuously monitor reference station data quality and alert station operators in the event of performance
degradation.
This approach affords the strategic positioning of onocoy in the existing GNSS industry as a shared infrastructure
commons, complementing and bringing together existing GNSS market stakeholders and new joiners (e.g. crypto
miners who want to operate reference stations), and providing synergies and benefits for all (see Figure 4).
By separating the operation of reference stations from the provision of value-added correction services, reference
stations can be shared among service providers via open communication protocols and hardware, avoiding redundancies
in the reference station infrastructure except those desired for robustness. By engaging communities to set up and
manage reference stations and validators, investments and operational costs for a network can be spread over a large
number of people, enabling the creation of a global and dense network, as in the case of the Helium network [Jagtap
et al., 2021].
Already today, onocoy offers publicly accessible, pay-per-use single-base RTK streams, thereby democratizing access to
correction data for mass markets and mitigating the effects of vendor lock-in. In particular, by focusing on single-base
4

---

## Page 5

onocoy: Enabling mass adoption of high precision GNSS positioning using web3 REVISION 3.0.1
Figure 4: onocoy’s strategic positioning in the existing GNSS market as a shared infrastructure benefiting all stakehold-
ers.
RTK, onocoy is not in competition with existing correction service providers that focus on value-added service on top
of their streams (e.g., VRS, PPP, PPP-RTK; see Section 4.1 for details on these technologies). In fact, onocoy reduces
both the capital and operating expenses for these stakeholders and provides an opportunity for them to grow into regions
currently not covered by their services, such as Africa, South America, and Asia. Furthermore, these stakeholders can
contribute their existing installed base of reference stations to onocoy and gain additional revenue.
Thus, business models suitable for mass-market applications become possible as there is a straight-forward per-use
charge and no limitations on market segments are imposed.
In summary, the advantages across the value chain are evident. They are:
• Reference station manufacturersget access to a mass market that would not exist without onocoy’s community-
powered network.
• Reference station operators gain new, or additional, distribution channels. Throughout a station’s lifetime,
they may sell data to onocoy for rewards, with upside potential based on data usage in the proximity of their
station (see onocoy’s rewarding concept in Section 3.3). Moreover, they benefit from real-time data quality
monitoring and reporting, guaranteed by onocoy validators.
• Providers of value-added correction services profit from cost-effective coverage expansion and additional
revenues from their existing network. Instead of needing to make vast infrastructure investments, they utilize
onocoy’s network and gain access to high-quality stations worldwide, taking advantage of a risk-free path to
network expansion and economies of scale.
• Product manufacturers (OEM) benefit from a larger addressable market. Worldwide availability of affordable
reference station data and correction services allows for mass adoption and hence increased hardware sales.
Furthermore, onocoy’s global coverage gives ease-of-use in scaling products and services.
• System integrators and operatorscan expand into new applications and services, with correction data becoming
affordable and available everywhere, be it single-base RTK or added value correction services.
• As a result of all of the above, end customers gain access to improved and/or new products, applications and
services.
5

---

## Page 6

onocoy: Enabling mass adoption of high precision GNSS positioning using web3 REVISION 3.0.1
onocoy’s strategic positioning results in a value proposition that complements existing value-added services in the
GNSS industry such that a mass market for high-precision positioning can be formed, built on a global, shared and
common CORS infrastructure.
2.3 onocoy enables fair access to novel humanity-serving applications
The creation of a global and dense CORS network will provide cost-effective access to the technology’s benefits and
enable novel humanity-serving applications: Currently, as illustrated, correction services are only available in high
income areas, e.g., Europe and North America, and in niche markets, e.g., precision agriculture, at high cost, thus
preventing a large part of the global population from accessing the benefits of applications built on it, e.g., autonomous
navigation in South America.
Worse, these barriers prevent the emergence of novel, humanity-serving applications facilitated by a global and dense
network such as i) improved weather monitoring and forecasting, ii) long-term climate measurement [Guerova and
Simeonov, 2021], and iii) large scale tsunami warning systems [Blewitt et al., 2009] that would be of great value to large
parts of the world population by, amongst others, mitigating and addressing the risks of climate change. For instance,
I) the ability to monitor weather more effectively and II) long-term climate measurements will improve humanity’s
ability to assess climate change mitigation actions by providing real-time feedback on countermeasures (required for a
complex system such as our society to self-organize [Ballandies et al., 2024a]), resulting in accelerated learning cycles.
3 onocoy’s cryptoeconomic design – efficient and resilient co-operation via web3
The design of the onocoy cryptoeconomy follows a value-sensitive design science research methodology [Ballandies
et al., 2024b]. This is a principled method that considers stakeholder values explicitly during the design and construction
of IT systems [Friedman et al., 2013, Van den Hoven et al., 2015]. Since a lack of consideration of stakeholder values
in the construction of a software artifact can result in technology rejection [Helbing, 2021], the failure of including
the values of onocoy’s stakeholders could prevent its mission of creating a community-powered global RTK reference
station network. Therefore it is important to identify the values for the onocoy network. The four most important ones
are:
• Participation: The team, investors, and community members must all participate in the project’s growth
• Progressive decentralization: The platform’s elements must become distributed over the long run
• Economic sustainability: onocoy must be a non-profit organization that generates sufficient funds to achieve
its mission
• Value sharing: Investors and contributors must have an attractive return/reward
These values are secured via web3 in onocoy’s platform by using i)blockchain-based tokens for interest realignment
among all stakeholders and to crowdsource investment cost into the global and dense reference station network; ii)
smart contracts to instantiate cost-effective and transparent mechanisms to handle large amount of micro-transactions
in a pay-per-use business model covering all world regions; and iii) adecentralized distributed ledger to secure and
robustify the network.
Utilizing the conceptual architecture introduced by Ballandies et al. [2021], the main parts of the onocoy system
are illustrated in Figure 5. These parts are the i) core economy, ii) off-chain governance, iii) investors, iv) on-chain
economy, and v) tokens. In particular, onocoy is a 2nd layer (L2) system built on top of an established blockchain,
utilizing smart-contract capability to facilitate on-chain governance and token issuance and transfer. onocoy is therefore
a decentralized application (dApp) built on a blockchain maintained by a third-party (community) which is utilized for
data storage and computation; this effectively removes the complexity and cost of maintaining one’s own blockchain
while increasing the transparency and trustworthiness of code/ mechanisms utilized.
At system initialization, some actions occur off-chain - that is, they are not stored on or executed by the blockchain. For
example, the management of funds received from early investors. Nevertheless, by following the value of progressive
decentralization, onocoy commits itself to over time move as much as reasonably possible on-chain to increase the
transparency and trustworthiness of the platform. The core economy that relies on both system tokens is the sharing of
GNSS measurements by continuously operating reference stations (CORS), also referred to as miners in web3, with
system users.
In this section, we detail the onocoy cryptoeconomic design (CED). In Section 3.1, we describe the token flows. In
Section 3.2, we describe the token design. In Section 3.3, we illustrate the rewarding concepts. In Section 3.4, we
describe the tokenomics and in Section 3.5 we present the governance of the onocoy system.
6

---

## Page 7

onocoy: Enabling mass adoption of high precision GNSS positioning using web3 REVISION 3.0.1
Figure 5: A presentation of the main elements of onocoy’s cryptoeconomic design, utilizing the conceptual architecture
introduced by Ballandies et al. [2021]
3.1 Token flow and core economy
Figure 6: onocoy’s two-tokendeflationary model: ONO is
utilized in onocoy’s governance and incentive design; Data
credits are obtained with Fiat (e.g. Dollar) and provide
access to correction data; Fiat is used to finance operations
(i.e. platform development, operations and ecosystem de-
velopment) and may be used for buy backs and burn
Figure 7: ONO token flow: ONO are released via halving
schedules and lock and vesting contracts; users can acquire
ONO to access system services, in turn financing onocoy’s
operation
Figure 6 illustrates the onocoy token model: a deflationary token model that facilitates the tying of system revenues with
ONO token value via the onocoy association and aligns the diverging needs of data users and reference station operators.
This facilitates stable FIAT prices for data access with the non-transferable data credit, while leveraging the advantages
of cryptoeconomic tokens for incentives [Ballandies, 2022] via the freely-tradeable ONO token. This ONO token is
a utility token that can appreciate in value which is traded at exchanges and contributors to the project are rewarded
with it (e.g. miners: owners of CORS that provide GNSS measurements to the system). Data credits are issued to data
users in exchange for Fiat (e.g. Dollar). Data user utilize these credits to access system services, which are burned once
utilized. The Fiat is used to finance operations (i.e. platform development, operations and ecosystem development)
and may be used to buy back, redistribute or burn ONO via the onocoy association (Figure 7). If and when a buy
7

---

## Page 8

onocoy: Enabling mass adoption of high precision GNSS positioning using web3 REVISION 3.0.1
Figure 8: ONO (left) and data credit (right) token design in the categorization scheme of Dobler et al. [2019]
back occurs, the ONO units are split between a reward pool that incentivizes system contributors and an ecosystem
development pool that finances maintenance and development of the onocoy system (see Figure 7). Data credits are
used to pay for the onocoy service. System service costs are denoted in FIAT, enabling customers to predictably know
how much system service they can access with their data credits. This solves the challenge of fluctuating token values
often observed in web3 to which traditional and risk-averse stakeholders from the GNSS industry are not accustomed to.
Data credits are burned when the service is consumed and are non-transferable. Thus, data credits can only be utilized
within the onocoy system2.
3.2 Token design
onocoy’s deflationary token model facilitates stable fiat prices for web3-agnostic customers while retaining the
advantages of having its own (value-gaining) blockchain-based token that can incentivize the setup and maintenance of
a global and dense physicial infrastructure network. In the following the ONO token and the data credit are illustrated.
3.2.1 ONO token
Figure 8 illustrates the ONO token design. The ONO token is a utility token that is used for governance in the onocoy
system (see Section 3.2.2).
The supply of ONO token units is capped (see “Supply: Capped” in Figure 8). Assuming an increasing demand for
ONO over time, keeping ONO supply fixed will create an upward price pressure on it. Also, should a buy back occur, a
part of the ONO token units are burned (see “Burn: Yes” in Figure 8), thus reducing the amount of available ONO
which creates a further upwards price pressure on the token by reducing its supply.
In order to guarantee incentives for service providers, i.e., miners, and to deploy and maintain a global and dense
reference station network, new ONO token units in the onocoy system are continuously released to providers subject to
a halving schedule (see “Creation Condition: Action” in Figure 8). In particular, onocoy chose a deflationary factor of
16% per year3, which results in a four-year halving schedule of newly created token units until no new tokens come into
existence (Figure 7), which is similar to the mechanism applied for block rewards in the Bitcoin system (not accounting
for token unit burns).
In order to function as a meaningful investment, the ONO token is transferable to enable a cash out by selling token
units (see “Transferability: Yes” in Figure 8). This also guarantees that stakeholders are not locked-in to the system.
Moreover, the ONO token is fungible to guarantee censorship resistance by preventing the discrimination of specific
token units (see “Fungible: Yes” in Figure 8).
3.2.2 data credit
Figure 8 illustrates the data credit design. The data credit facilitates the functioning of onocoy’s core economy: By
burning data credits, users obtain access to RTK correction data streams. Data stream prices are nominated in data
credits, which provides value to the token (see “Source of value: Action” in Figure 8). Thus, by retaining data credits,
users can predictably know for how long they will be able to access correction data streams. New data credit units come
into existence by performing the action of buying it with Fiat (e.g. Dollar) from the onocoy association (see “Creation
condition: Action” in Figure 8). In particular, the data credit value is pegged in this way to a FIAT currency, i.e.,
2Note that, because the data credit is non-transferable and cannot be swapped back to ONO, no third-party market can form on
data credits and hence it cannot function as a stable coin.
3Each year the amount of newly available ONO token units are reduced by 16 %
8

---

## Page 9

onocoy: Enabling mass adoption of high precision GNSS positioning using web3 REVISION 3.0.1
Figure 9: Miners’ rewards in the onocoy network consist of three components that are added together: i) a (possibly
boosted) base reward, ii) a usage reward, and iii) a promotional reward.
the USD, which makes data credit stable in relation to those currencies, a prerequisite for risk-averse GNSS industry
to accept it as a payment standard. In order for the data credit to not be a stable coin, it is non-transferable 4 (see
“Transferability: No” in Figure 8). In particular, data credits cannot be swapped back to Fiat. Thus users can utilize the
data credit only within the onocoy system for accessing data streams.
In contrast to the ONO token, the data credit supply is uncapped (see “Supply: Uncapped” in Figure 8) to account for a
potentially unlimited amount of users accessing an unlimited amount of data streams. In order to function as a unit of
account (of potential time to access correction data streams), the data credit is fungible (see “Fungible: Yes” in Figure
8).
3.3 Rewarding concept
Several forms of rewards are provided to contributors of the onocoy system. In this section, we describe the rewards
scheme for miners. Other forms of rewards, e.g. a bounty program for bug identification, grant schemes for network
development or validator staking for network security and decentralization are discussed and may be introduced in the
future.
3.3.1 Miner rewarding
onocoy incentivizes network rollout and maintenance by rewarding data contributors, also referred to as data miners.
The amount of received rewards is scaled according to multiple factors such as: i) signal quality, ii) signal diversity, iii)
station availability, and iv) location context. Also, special incentives are utilized for early adopters, targeted network
expansions and upgrades.
Figure 9 depicts the miner rewards scheme: The Base Reward is the reward that miners receive irrespective of the usage
of their data and consists of four components:
The Daily ONO Base Reward, representing the maximum base reward a miner can earn per day. The value is set by
the rewards commission5 (see Figure 7) based on a target fiat amount6, modified with an Early Mover Boost that is
initially set at 5. Both the Base Reward and the Early Mover Boost are periodically set to be updated by the rewards
commission, with the intention that the base reward doesn’t change too frequently and the boost decrease over time. For
the initialization, the choice of Base Reward reflected a fair yearly amortization for a typical reference station and the
boost reflected a risk premium for miners that takes into account an already existing base load of reference stations. The
Quality Scale represents the type and quality of GNSS measurements submitted to the system and is decomposed into
“Supported Signals” and “Signal Quality”. TheAvailability Scale represents the availability and continuity of the GNSS
measurements to the clients/customers (e.g. uptime). The Location Scale motivates the optimal distribution of CORS
by penalizing overpopulated areas.
The Usage Reward incentivizes sharing the success of the onocoy service within certain regions. The usage reward
considers the actual utility (number of data streams in use) and the potential utility (improvement in signal quality) of a
particular region which are shared among all miners of a region. Thus, miners of a particular region are incentivized
to work together to increase the usage of their data, with the goal of the emergence of a regional community spirit.
Furthermore, this incentive is designed as a feedback mechanism for miners to identify valuable spots for reference
station deployment such that onocoy results in a self-regulating and self-organizing system [Ballandies et al., 2024a].
4If the data credit would be transferable, an external market for data credits could form with potentially another exchange rate
between data credit and FIAT then the one facilitated by the onocoy system. Hence, onocoy would be required to employ mechanisms
that would stabilize data credits around the desired exchange, making onocoy a stable coin project.
5The rewards commission consists of members of the association.
6Having fiat-fixed rewards for miners has been shown to be required to adequately reward them [Kalabi´c et al., 2023].
9

---

## Page 10

onocoy: Enabling mass adoption of high precision GNSS positioning using web3 REVISION 3.0.1
Pool Percentage
of all
Tokens
Release
once
contin.
lock/
vest.
halving
Team 10% x x
Ecosystem 32% x x x
Community 40% x x
Investors 14% x x
Listing &
Market Making 4% x
Figure 10: Distribution and release schedule of the 810 million ONO token units among the different stakeholders
Figure 11: Dilution of the ONO token over time
3.4 Tokenomics
The ONO token is distributed among the stakeholder groups as shown in Table 10. For both founders and investors,
tokens are vested with linear monthly vesting in equal instalments; this reduces downward price pressures on the
ONO token via token sales while facilitating a commitment of the team and investors to the network. In contrast, the
community and miners continuously receive their token units as rewards for their delivered service. The vesting of
the team’s and investors’ tokens ensures continued engagement, while the tokens of the other groups are immediately
available, providing a timely return for them in order to i) encourage network growth in the early days and ii) account
for an appreciating value of the ONO token over time. The token units released to the miners and the community are
subject to a four-year halving schedule, following recent findings that a deflationary factor is required in DePIN token
models to have a stable economy [Kalabi´c et al., 2023].
10

---

## Page 11

onocoy: Enabling mass adoption of high precision GNSS positioning using web3 REVISION 3.0.1
Figure 12: Results of our simulation showing expected
revenues, token supply and derived value appreciation of
the ONO token.
ONO Token Holders
onocoy association
Token pools FIAT IP
Contractors
Contract
Employees 3 rd parties
Consulting 
contract
Control (Governance)
Owns
2
Figure 13: Legal setup of onocoy’s off-chain governance:
A decentralized autonomous association governed by ONO
token holders which eventually merges the on-chain con-
cept of a DAO with the legal representation of an associa-
tion.
This token release schedule manifests into a continuous and decreasing release of tokens over time as depicted in
Figure 11.
A rigorous analysis of ONO’s value appreciation has been performed by using Kalabi´c et al. [2023] and approximating
onocoy’s deflationary token model model as a discrete-time, full-information, dynamic game. In this game, all
participants are aware of future revenue, so there is no need for speculation and an optimal policy for each participant
can be derived. Figure 12 illustrates results from our base scenario assuming a realistic growth in revenues (see the top
image in Figure 12) taken from the European Commission report [EUSPA, 2022]. Based on these numbers and the
illustrated token dilution schedule (see Figure 11), the circulating token supply (see the middle image in Figure 12) and
the value appreciation of the ONO token (see the bottom image in Figure 12) are derived. The result is a lower, i.e.,
worst-case, bound on the token price since the only factor considered is the value derived from data revenue. Novel
applications like indoor navigation could be facilitated by the platform that would create a further demand for onocoy
services as illustrated in Figure 14, which is not currently considered in the simulation.
3.5 Governance
The purpose of onocoy’s governance is to i) enable participation of all stakeholders; ii) enable autonomous improvement;
and iii) prevent power concentration by any one stakeholder or a group of stakeholders. These elements, in combination,
facilitate onocoy’s collective intelligence, which can manage the network successfully in a rapidly changing and
complex environment [Ballandies et al., 2024a]. To enable all of the above, the governance follows the value of
progressive decentralization. In the long run, governance should be decentralized.
Initially, the system utilizes on-chain majority voting with one ONO token unit equaling one vote facilitated via Realms7
as its community decision mechanisms. However, in the future, different voting mechanism 8 may be employed to
improve the alignment of the vote result with community sentiment [De Tocqueville, 1838, Helbing et al., 2023].
In order to facilitate the progressive decentralization of the system, we have chosen to establish onocoy as a not-for-profit
Swiss association, following the best-practice approach of decentralized autonomous associations (DAAs) [Ganzoni,
2022]. The association is controlled by its members in accordance with their voting power based on the square root of
the tokens represented (e.g., 1 vote power equals 1 vote, but 4 vote powers equal 2 votes, 9 vote powers – 3, and so on).
The association owns the intellectual property and system funds, and contracts third parties to develop and maintain
7https://www.realms.today
8e.g. such as such as Borda count or approval voting combined with a square-root voting to prevent power concentration
11

---

## Page 12

onocoy: Enabling mass adoption of high precision GNSS positioning using web3 REVISION 3.0.1
Figure 14: Over time, novel applications are emerging which create a further upward pressure on the token price,
besides the one illustrated in Figure 12.
the onocoy system (see Figure 13). One of these third parties is the onocoy Services AG in which some of the initial
team members have been organized. The goal is to nurture a rich ecosystem of such third-party companies and services.
The core team is organized as a Teal9 organization [Laloux and Wilber, 2014] that is based on, among other things,
contributor autonomy and peer relationships.
In summary, onocoy has established a Swiss association as a legal entity with the following characteristics:
• It is not-for-profit
• Its purpose is the development, deployment and promotion of the onocoy platform
• It establishes a vibrant ecosystem around the platform
• It can pursue its purpose by performing the necessary task itself or by outsourcing them, e.g., to onocoy
Services AG
• It will issue tokens for initial financing and to fund growth
• It may hold interests in additional legal entities
• It is kept as lean as possible
• It adopts supplementary regulations stipulating that strategic decisions are made on the basis of ONO token
shares via quadratic voting
4 onocoy’s IT infrastructure and validation
onocoy’s mission is to develop a dense and globally distributed network of independent miners that delivers low latency
and high-quality GNSS measurements to a diverse base of clients via onocoy’s decentralized platform. The platform is
currently divided into three components: i) a blockchain, which implements the economics and governance presented in
Section 3, ii) the validator, which utilizes a variety of GNSS processing techniques to determine the quality of reference
data streams (see Section 4.1), and iii) a real time communications network, which connects all components such that
low latency of the real-time critical data is ensured. (see Figure 15 for a depiction).
At the time of writing, onocoy’s economic component has been deployed via smart contracts on the Solana blockchain,
whereas the validator, caster, MQTT communication network and database are still centrally managed by the onocoy
association. onocoy’s backend is based on a 3 layer architecture:
9Teal organizations are based on an organizational theory of workers’ self-management.
12

---

## Page 13

onocoy: Enabling mass adoption of high precision GNSS positioning using web3 REVISION 3.0.1
Figure 15: onocoy’s IT infrastructure
• Frontend services (NTRIP caster endpoints, console UI)
• MQTT backbone (communication network)
• Backend services (api, validator, database)
To interface both with the external CORS stations and Clients, onocoy uses open industry standards to exchange data
(RTCM 3.x and NTRIP 1.0/2.0 HTTP) by implementing the caster functionality. This to maximize compatibility
and realize the objective to become a shared platform for the GNSS industry that is inclusive to all existing and new
stakeholders.
onocoy’s system architecture is designed with scalability in mind. System critical components can be replicated to
accommodate demand and increase redundancy. Multi-region scalability can be achieved by replicating the cluster and
bridging the MQTT brokers across geographical regions.
This modular design, using loosely coupled components, enables the system to accommodate changes and updates
without significant disruption. It allows for integration of new components or functionalities and enables the system to
evolve as needed.
By following the principle of progressive decentralization that facilitates resilience and robustness of the onocoy
platform, all of these components will eventually be decentralized. The validators may use a proof-of-stake-type
algorithm to determine consensus on the quality of data streams, while the caster and MQTT implementation will be
expanded with additional technologiesas needed in order to simplify further decentralization of those.
In the following, we present information regarding validator framework (Section 4.1) and the base reward function
(Section Section 4.2). Further details regarding decentralization of the caster and communication network and the other
types of rewardings in onocoy are forthcoming.
4.1 Validator framework
GNSS measurements submitted by miners are the raw data that a GNSS receiver observes from the signals transmitted
by GNSS satellites. These measurements typically contain the time of transmission of the satellite signal and a coarse
distance measurement - the pseudorange measurement. Additional measurements captured by the receiver include the
carrier-phase and Doppler measurements, where carrier-phase measurements are critical for attaining centimeter-level
real-time performance.
13

---

## Page 14

onocoy: Enabling mass adoption of high precision GNSS positioning using web3 REVISION 3.0.1
The GNSS measurements submitted to onocoy’s system are rigorously assessed via the validators to guard against
the submission of spoofed and synthetic GNSS measurements. While spoofed GNSS measurements are intentionally
deceptive, synthetic GNSS measurements are not typically classified negatively as they provide value-added service in
the form of correction data. At onocoy, submission of synthetic GNSS measurements is considered fraudulent as it is
seen as an attempt by the miner to emulate authentic GNSS measurements, which leads to undeserved rewards.
In the following, an overview of spoofing and synthetic measurements is presented in Sections 4.1.1 and 4.1.2,
respectively. Section 4.1.3 then gives an overview of onocoy’s strategy to ensure authentic GNSS measurements are
accepted by the platform.
4.1.1 Spoofing
Spoofing refers to the deliberate manipulation or falsification of signals or data in order to deceive or mislead a receiver
or system [Jafarnia-Jahromi et al., 2013]. The spoofed GNSS measurements are intentionally generated to deceive
a GNSS receiver. Spoofing involves broadcasting fake GNSS signals that mimic accurate GNSS signals but with
intentionally modified parameters that cause a receiver to calculate an incorrect position or timing solution [Humphreys
et al., 2008].
Spoofing attacks can be carried out using various techniques, such as signal generators, software-defined radios, or
replay attacks [Humphreys et al., 2008]. A spoofing attack usually aims to gain unauthorized access to a system or
disrupt its operation. Spoofing attacks can have serious consequences, especially in applications that rely on high-
precision positioning, such as aviation, maritime, or military applications. Spoofing attacks typically cause receivers
to calculate a false position or time, resulting in navigation errors, collisions, or other safety risks. GNSS systems
typically use techniques such as encryption, signal authentication, and anti-jamming measures to prevent spoofing
attacks [Humphreys et al., 2008].
4.1.2 Synthetic measurements
Synthetic GNSS measurements are artificially generated measurements that are not ordinarily intended to deceive
a GNSS receiver but provide additional or augmented measurements to complement actual GNSS measurements.
Synthetic GNSS measurements can be generated using a variety of methods. However, the most common method
is generating correction data for augmentation purposes. One common source of synthetic measurements is from
correction service providers that transmit correction data using an Observation Space Representation (OSR). The
alternative representation of correction data is using State Space Representation (SSR), where the correction data is
de-correlated into their respective state terms. OSR synthetic measurements are, by design, in a similar format as the
GNSS measurements. It is also possible to convert SSR-formatted correction data into an OSR format by transforming
the correction data from the state-space domain into the observation-space domain [Seepersad, 2018].
4.1.3 Validating of GNSS measurements
At onocoy, we have deployed a multi-level GNSS measurement processing scheme to guard against the submission
of spoofed and synthetic measurements. We examine GNSS measurements over varying time scales using different
processing techniques and adjustment methods. We focus on comparing the consistency of the estimated receiver, signal
and satellite-dependent state terms across different processing techniques. In Figure 16, we present an overview of the
different GNSS measurement processing techniques, which include Single Point Positioning (SPP), differential GNSS
(DGNSS) code, Real-Time Kinematic (RTK) and Precise Point Positioning Ambiguity Resolution (PPP-AR). At onocoy,
real-time processing is performed using the SPP, DGNSS code and RTK techniques. Daily PPP-AR ensures the miner’s
location is determined in a global reference frame. More importantly, within the context of fraud detection, PPP-AR
ensures global consistency of satellite carrier-phase biases. Post-processed relative baseline solutions are determined
against trusted Tier 1 and Tier 2 reference station infrastructure. The varying time scale of the post-processed solution
is primarily due to the delayed access of sub-networks of Tier 1 and Tier 2 infrastructure in addition to the utilization of
precise orbit and clock products on longer baseline processing. A critical step in our fraud detection is the generation of
atmospheric delays and satellite biases from a network solution to ensure consistency amongst a network of miners.
Network solutions will be compared against products generated for scientific application to ensure reliability from an
independent data source.
As previously mentioned, by design, onocoy opted for an ecosystem that accepted hardware from various GNSS
manufacturers as the focus is on developing a community-powered and shared initiative. The GNSS measurement
validation framework in Figure 16 has shown high resilience to various attacks examined thus far.
14

---

## Page 15

onocoy: Enabling mass adoption of high precision GNSS positioning using web3 REVISION 3.0.1
Figure 16: GNSS measurement validation framework
4.2 Measuring the base reward components
Using the validator framework (see Section 4.1), the scales of the miner’s base reward are calculated (see Figure 9).
The following sub-section details the calculations of the location scale, quality scale, and the availability scale.
4.2.1 Quality scale
The quality scale refers to the supported GNSS measurements submitted by the miner as well as the quality of the
measurements. Supported GNSS measurements and the measurement quality are determined by metrics derived from
the different GNSS processing methods of Figure 16. Supported GNSS measurements consider the major GNSS (GPS,
Galileo, BeiDou and GLONASS) and RNSS (QZSS and IRNSS) constellations. Table 1 presents the reward rate
assuming all major GNSS and RNSS were visible. A miner located in Eastern America is expected not to see both
QZSS and IRNSS, as such, the reward rate would be updated to exclude these two constellations. GLONASS is given
lower importance relative to GPS, Galileo and BeiDou due to the measurement quality of Frequency Division Multiple
Access (FDMA) measurements in contrast to the Code Division Multiple Access (CDMA) [J.A Ávila Rodríguez,
2011]10. Lower importance is given to QZSS and IRNSS due to their regional coverage.
Each constellation transmits a variety of different frequencies and modulations [J. Sanz Subirana and Hernandez-Pajares,
2011]. Priority is given to the number of available nominal frequencies. Table 2 shows the scale factor with respect to
the number of nominal frequency bands that are available.
To determine the quality of the measurements, a variety of different metrics are utilized. These metrics include
cycle-slip-free epochs, GDOP, measurement availability, pseudorange and carrier-range post-fit residuals, solution
position error as well as the ambiguity resolution fixing rate. In the near term, the metrics would be expanded to include
position repeatability. Table 2 shows the optimal range of values per metric to attain the full-scale factor. These ranges
are expected to be further optimized in the near-term to ensure miners are compensated fairly based on the variety of
different hardware qualities that are submitted to the onocoy network.
10Note that onocoy anticipates equal rewards for GLONASS once its modernization efforts attain operational status.
15

---

## Page 16

onocoy: Enabling mass adoption of high precision GNSS positioning using web3 REVISION 3.0.1
Constellation Scale factor
GPS 0.263
GAL 0.263
BDS 0.263
GLO 0.132
QZSS 0.039
IRNSS 0.039
Table 1: Reward-rate per constellation availability
Frequency Bands Scale Factor
L1 or L5 only 0.08
L1+L2 or L1+L5 0.32
L1+L2+L5 0.8
L1+L2+L5+L6 1
Table 2: Reward-rate per frequency band availability.
Measurement quality performance metric Optimal conditions to earn full reward
cycle-slip-free epochs > 80%
measurement availability > 60%
pseudorange post-fit residuals (rms error) < 0.5 m
carrier-range post-fit residuals (rms error) < 0.02 m
solution position error < 1 cm horizontal and < 3 cm vertical
ambiguity resolution fixing rate > 80%
GDOP < 5
Table 3: Optimal conditions to earn full measurement scale factor
4.2.2 Location scale
Conventional single-frequency RTK performance is limited to baselines of less than 15km, as longer baselines may
not effectively account for errors within the GNSS measurement. The objective of relative positioning is to reduce or
eliminate error sources by mathematically differencing simultaneous GNSS measurements from multiple receivers.
Accuracy in conventional single-frequency RTK is correlated with baseline length and amounts to approximately 0.1 to
1 ppm for baselines up to some 100km and then less for longer baselines [Euler and Schaffrin, 1991]. In Seepersad et al.
[2015], baselines were extended up to 50 km under optimal ionospheric conditions, and altitude differences were limited
to 400 m due to differences in tropospheric effects. These findings, which are well documented in the literature [Tobias
et al., 2011, Rothacher, 2002, Euler and Schaffrin, 1991], highlight two important factors in the spatial distribution of
miners which include sensitivity to varying baseline lengths in 1) the horizontal component, and 2) elevation difference.
The goal of the location scale is to
• incentivize spatial distribution of infrastructure
• ensure necessary infrastructure redundancy
• encourage the installation of higher-quality miner infrastructure in areas with low-quality miners (in availability
and signal quality)
The current version of the location scale issues a penalty to miners within a defined radius of each other (initially set
to 50km). To allow infrastructure redundancy, nearest neighbours are excluded from the calculations. The amount of
16

---

## Page 17

onocoy: Enabling mass adoption of high precision GNSS positioning using web3 REVISION 3.0.1
nearest neighbours which are excluded will be revised regularly and depends on the evolution of the network. A full
penalty is applied to non-excluded neighbours within a close radius (initially 15km) as no additional information is
gained once we have established the necessary infrastructure redundancy. To minimize clustering during the rollout of
the network, a less stringent penalty is applied to those > 15 km and < 50 km.
The implementation is performed as follows.
1. An inner and an outer radius for distances is defined based on the 3D distance, where the inner reward radius
is 15 km and the outer reward radius is set to 50 km.
2. For each base station, all nearby base stations are listed ordered by distance ascending where distance represents
the 3D baseline distance between the current station and the neighbouring station. The current station has an
index equal to 0 and neighbouring stations range from 1 to N where N is the total number of stations within
the outer radius.
3. The first X neighbours are ignored from further calculations, where X is the designated infrastructure
redundancy value.
4. The distance penalty for miners within the search area is determined, where the distance penalty is a value
between 1 (full penalty) and 0 (no penalty). If the distance is less than the inner radius, the distance penalty
will be set to 1. Between the inner and outer radius, the distance penalty decreases quadratically from 1 to 0.
5. The distance penalty based on a shared factor is determined, where the shared factor is defined as the ratio of
the grades (quality and availablity) of both stations. The shared factor is a value linear between 0 (no rewards)
and 1 (full rewards).
6. The location scale is determined by multiplying all reduction factors.
4.2.3 Availability scale
The availablity scale represents the completeness of a data stream during a given time period. Next to the connection
duration, also measurement availablity is monitored, as a RTCM station is expected to send a full data set every
epoch/second. A dynamic system grant is added to the measured availability to cope with potential system/network
errors. The value of a station regarding its availability is not a linear function as a continuous stream is key for the
data consumers. Therefore data availability below a threshold (initially 80%) is set to a scale of 0, and an exponential
function (initially quadratic) is used to model the availability scale between measured data availablity between 80% and
100%.
5 Call for action
onocoy is on a mission to provide a dense, high-quality GNSS reference station network to unlock the enormous
potential of high-precision positioning all across the globe. To do so, it relies on cutting-edge web3 concepts including
smart contracts, community participation, and blockchain technologies.
onocoy’s unique approach decouples GNSS reference station infrastructure management from correction service provi-
sion. Token-based incentives and the systematic use of open standards allows onocoy to tap into the existing installed
base of mass market GNSS reference stations and, when required, bring about targeted infrastructure development,
quickly and efficiently closing gaps in geographical coverage and technological capabilities. onocoy is the most efficient
way to solve the ecosystem problem of creating a global and dense GNSS reference station network.
Our vision is to build this network as a decentralized, and transparent system to ensure inclusive, discrimination-free
access to and use of GNSS high-precision technology across all borders.
To achieve this ambitious goal, we require the skills, contributions and visions of each and every one of you – GNSS
experts and enthusiasts, web3 hodlers and builders, IT specialists and hackers, ROI miners and idealists –
We require you.
Join us.
We are on a mission.
17

---

## Page 18

onocoy: Enabling mass adoption of high precision GNSS positioning using web3 REVISION 3.0.1
Figure 17: Let’s unite – for a future that brings high-precision positioning to earth and beyond.
References
Peter J. G. Teunissen and Oliver Montenbruck, editors. Springer Handbook of Global Navigation Satellite Sys-
tems. Springer International Publishing, 2017. ISBN 3319429280. URL https://www.ebook.de/de/product/
29520086/springer_handbook_of_global_navigation_satellite_systems.html.
Sami Kassab. The depin sector map. https://messari.io/report/the-depin-sector-map , 2023. (Accessed
on 03/07/2023).
Michael TC Chiu, Sachit Mahajan, Mark C Ballandies, and Uroš V Kalabi´c. Depin: A framework for token-incentivized
participatory sensing. arXiv preprint arXiv:2405.16495, 2024.
EUSPA. Euspa eo and gnss market report. Frontiers in Neuroscience, 1, 2022. doi:10.3389/fnins.2013.12345. URL
https://www.euspa.europa.eu/sites/default/files/uploads/euspa_market_report_2022.pdf.
Jorão Gomes Jr. Three sided market model, 2022. URLhttps://github.com/cadCAD-org/demos/blob/master/
demos/Multiscale/ThreeSided/ThreeSidedMarket.ipynb.
Dhananjay Jagtap, Alex Yen, Huanlei Wu, Aaron Schulman, and Pat Pannuto. Federated infrastructure: usage, patterns,
and insights from" the people’s network". In Proceedings of the 21st ACM Internet Measurement Conference, pages
22–36, 2021.
Guergana Guerova and Tzvetan Simeonov. Global Navigation Satellite System Monitoring of the Atmosphere. Elsevier,
2021.
Geoffrey Blewitt, William C Hammond, Corné Kreemer, Hans-Peter Plag, Seth Stein, and Emile Okal. Gps for real-time
earthquake source determination and tsunami warning systems. Journal of Geodesy, 83(3):335–343, 2009.
Mark C Ballandies, Dino Carpentras, and Evangelos Pournaras. Daos of collective intelligence? unraveling the
complexity of blockchain governance in decentralized autonomous organizations. arXiv preprint arXiv:2409.01823,
2024a.
Mark C Ballandies, Valentin Holzwarth, Barry Sunderland, Evangelos Pournaras, and Jan vom Brocke. Advancing
customer feedback systems with blockchain: When design science research meets value-sensitive design. Business &
Information Systems Engineering, pages 1–23, 2024b.
Batya Friedman, Peter H Kahn, Alan Borning, and Alina Huldtgren. Value sensitive design and information systems.
In Early engagement and new technologies: Opening up the laboratory, pages 55–95. Springer, 2013.
Jeroen Van den Hoven, Pieter E Vermaas, and Ibo Van de Poel.Handbook of ethics, values, and technological design:
Sources, theory, values and application domains. Springer, 2015.
18

---

## Page 19

onocoy: Enabling mass adoption of high precision GNSS positioning using web3 REVISION 3.0.1
Dirk Helbing. Next Civilization: Digital Democracy and Socio-Ecological Finance-How to Avoid Dystopia and
Upgrade Society by Digital Means. Springer Nature, 2021.
Mark C Ballandies, Marcus M Dapp, and Evangelos Pournaras. Decrypting distributed ledger design—taxonomy,
classification and blockchain community evaluation. Cluster Computing, pages 1–22, 2021.
Mark C Ballandies. To incentivize or not: impact of blockchain-based cryptoeconomic tokens on human information
sharing behavior. IEEE Access, 10:74111–74130, 2022.
Martin Dobler, Mark Ballandies, and Valentin Holzwarth. On the extension of digital ecosystems for scm and customs
with distributed ledger technologies requirements analysis, innovation assessment, and prototype design for the lake
constance region. In 2019 IEEE International Conference on Engineering, Technology and Innovation (ICE/ITMC),
pages 1–8. IEEE, 2019.
Uroš Kalabi´c, Mark C. Ballandies, Krzystof Paruch, Heinrich Nax, and Thomas Nigg. Burn-and-mint tokenomics:
Deflation and strategic incentives. In Int. Workshop Decentralized Physical Infrastructure Networks, page submitted
for publication, 2023.
Alexis De Tocqueville. Democracy in America... Translated by Henry Reeve, volume 2. Saunders&Otley, 1838.
Dirk Helbing, Sachit Mahajan, Regula Hänggli Fricker, Andrea Musso, Carina I. Hausladen, Cesare Carissimo,
Dino Carpentras, Elisabeth Stockinger, Javier Argota Sanchez-Vaquerizo, Joshua C. Yang, Mark C. Ballandies,
Marcin Korecki, Rohit K. Dubey, and Evangelos Pournaras. Democracy by design: Perspectives for digitally
assisted, participatory upgrades of society. Journal of Computational Science, 71:102061, 2023. ISSN 1877-7503.
doi:https://doi.org/10.1016/j.jocs.2023.102061. URL https://www.sciencedirect.com/science/article/
pii/S1877750323001217.
Romedi Ganzoni. Daos - an overview of legal and regulatory pitfalls. Presented at DAO Suisse Symposium, Zurich,
Switzerland, 2022.
Frederic Laloux and Ken Wilber. Reinventing organizations: A guide to creating organizations inspired by the next
stage of human consciousness, volume 360. Nelson Parker Brussels, 2014.
Ali Jafarnia-Jahromi, Saeed Daneshmand, and Gérard Lachapelle. Spoofing countermeasure for gnss receivers-a review
of current and future research trends. European Space Agency, 4:6, 2013.
Todd E Humphreys, Brent M Ledvina, Mark L Psiaki, Brady W O’Hanlon, Paul M Kintner, et al. Assessing the
spoofing threat: Development of a portable gps civilian spoofer. In Proceedings of the 21st International Technical
Meeting of the Satellite Division of The Institute of Navigation (ION GNSS 2008), pages 2314–2325, 2008.
Garrett Goberdhan Seepersad. Improving reliability and assessing performance of global navigation satellite system
precise point positioning ambiguity resolution. 2018.
FAF Munich J.A Ávila Rodríguez. Fdma vs. cdma - navipedia, 2011. URL https://gssc.esa.int/navipedia/
index.php/FDMA_vs._CDMA.
JM. Juan Zornoza J. Sanz Subirana and M. Hernandez-Pajares. Gnss signal - navipedia. https://gssc.esa.int/
navipedia/index.php/GNSS_signal, 2011. (Accessed on 05/11/2023).
H-J Euler and B Schaffrin. On a measure for the discernibility between different ambiguity solutions in the static-
kinematic gps-mode. In Kinematic Systems in Geodesy, Surveying, and Remote Sensing: Symposium No. 107 Banff,
Alberta, Canada, September 10–13, 1990, pages 285–295. Springer, 1991.
G Seepersad, J Aggrey, M Gill, S Bisnath, D Kim, and H Tang. Relative positioning using rtk measurement filtering
and ppp. In Proceedings of the 28th International Technical Meeting of the Satellite Division of The Institute of
Navigation (ION GNSS+ 2015), pages 2537–2547, 2015.
Guillermo Tobias, Cristina Garcia, Alvaro Mozo, Pedro Navarro, Ricardo Piriz, Irma Rodriguez, and Daniel Rodriguez.
Filling in the gaps of rtk with regional ppp. In Proceedings of the 24th International Technical Meeting of The
Satellite Division of the Institute of Navigation (ION GNSS 2011), pages 2193–2201, 2011.
M Rothacher. Estimation of station heights with gps. In Vertical Reference Systems: IAG Symposium Cartagena,
Colombia, February 20–23, 2001, pages 81–90. Springer, 2002.
19

---
