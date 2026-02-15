# Top miner questions

## Table of Contents

### Reference Station Setup

* [**Which equipment can I use to set up a station?**](#which-equipment-can-i-use-to-set-up-a-station)
* [**Where shall I put my antenna?**](#where-shall-i-put-my-antenna)
* [**What do I need to connect my device? Do I need WIFI?**](#what-do-i-need-to-connect-my-device-do-i-need-wifi)
* [**What happens if I want to change the location of my station/antenna/receiver?**](#what-happens-if-i-want-to-change-the-location-of-my-station-antenna-receiver)

### Device & Stream

* [**My credential limit is reached. How can I add another station?**](#my-credential-limit-is-reached.-how-can-i-add-another-station)
* [**My station does not support the NTRIP server function, but NTRIP caster. Can you retrieve the streams from my caster directly if I expose it on the Internet?**](#my-station-does-not-support-the-ntrip-server-function-but-ntrip-caster.-can-you-retrieve-the-streams)
* [**What NTRIP Messages need to be enabled on my GNSS reference receivers in order to get best rewards?**](#what-ntrip-messages-need-to-be-enabled-on-my-gnss-reference-receivers-in-order-to-get-best-rewards)
* [**What latency is tolerable from the GNSS receiver to the onocoy system?**](#what-latency-is-tolerable-from-the-gnss-receiver-to-the-onocoy-system)
* [**How does onocoy prevent fraudulent correction streams?**](#how-does-onocoy-prevent-fraudulent-correction-streams)
* [**Can I provide data from a 3rd party service, such as public networks like IGS or other publicly or privately owned networks?**](#can-i-provide-data-from-a-3rd-party-service-such-as-public-networks-like-igs-or-other-publicly-or-pr)
* [**My station frequently disconnects. What can I do?**](#my-station-frequently-disconnects.-what-can-i-do)
* [**I have privacy concerns. Is the precise location of my device/antenna disclosed?**](#i-have-privacy-concerns.-is-the-precise-location-of-my-device-antenna-disclosed)

### Rewards

* [**Why are my rewards not as high as expected?**](#why-are-my-rewards-not-as-high-as-expected)
* [**My wallet is not connecting. What can I do?**](#my-wallet-is-not-connecting.-what-can-i-do)
* [**How is the location scale calculated?**](#how-is-the-location-scale-calculated)
* [**How much will I earn streaming RTK correction data to onocoy?**](#how-much-will-i-earn-streaming-rtk-correction-data-to-onocoy)
* [**Why does onocoy use blockchain technology?**](#why-does-onocoy-use-blockchain-technology)
* [**If the rewards received from miners are immediately exchanged for FIAT, the token price must drop. How is this mitigated/addressed?**](#if-the-rewards-received-from-miners-are-immediately-exchanged-for-fiat-the-token-price-must-drop.-ho)
* [**How do I claim my rewards?**](#how-do-i-claim-my-rewards)

### Receiving a Correction Stream

* [**The position provided by my onocoy enabled RTK rover doesn't match my expectation, there is a shift in position, in what datum is the position provided?**](#the-position-provided-by-my-onocoy-enabled-rtk-rover-doesnt-match-my-expectation-there-is-a-shift-in)

## Answers

### Reference Station Setup

#### Which equipment can I use to set up a station?

You can use any GNSS device that is capable to transfer the data via NTRIP. We recommend a few station bundles in the [Get a station](https://docs.onocoy.com/documentation/3.-become-a-miner/1.-get-a-station) page.

While you can use any device, note that not every decive will give you full rewards. The rewards depend on several factors which we listed on the [Reward Calculation](https://docs.onocoy.com/documentation/8.-faq-troubleshooting/broken-reference) page.

#### Where shall I put my antenna?

Ideally, fix your antenna to a location with a full sky view. This could be a roof, a chimney, or in a field. Above 10 degrees elevation angle, nothing should obstruct the view. Also, make sure that your antenna is not moving, even in heavier weather situations such as strong winds.

#### What do I need to connect my device? Do I need WIFI?

You need a stable internet connection, whether it is via WiFi or Ethernet depends on your device.

#### What happens if I want to change the location of my station/antenna/receiver?

Moving the device to another location will not be a problem. You just need to pass the data validation process once more.

###

### Device & Stream

#### My credential limit is reached. How can I add another station?

Please contact <support@onocoy.com> stating your account email address and your desired number of additional stations. We will adapt a new credential limit for you.

#### My station does not support the NTRIP server function, but NTRIP caster. Can you retrieve the streams from my caster directly if I expose it on the Internet?

No, due to complexities and efforts involved (Networking, Firewalls, Dynamic IP addresses etc) this is not a reliable way to provide data. Please contact the manufacturer of your station to add NTRIP server functionality.

#### What NTRIP Messages need to be enabled on my GNSS reference receivers in order to get best rewards?

The ideal receiver provides RTCM 3.0 MSM7 Messages: 1077 (GPS), 1087 (Glonass), 1097 (Galileo), 1117 (QZSS), 1127 (Beidou) and 1137 (IRNSS/NavIC). Lower Tier Messages (eg MSM4, MSM5 and MSM6 messages, like 1074, 1086 etc) are supported. MSM Messages of type MSM1, MSM2 or MSM3 are ignored and not rewarded.

Messages shall be sent once per second. Higher rate submissions will be ignored. Lower rate submissions, e.g. only every few seconds will result in reduced rewarding.

Submitting Messages for SBAS constellations (i.e. messages between 1104 and 1107) will not gain additional rewards.

Enable as many signals per constellation as possible (i.e. L1, L2, L5 etc).

#### What latency is tolerable from the GNSS receiver to the onocoy system?

The end to end latency, i.e. from the moment the signals are received until the data is within the onocoy system shall be below 1 second. Larger latencies will result in reduced rewards and possibly disconnection of the miner.

#### Do I have to set the receiver in a special Reference station mode, in order to determine its accurate location?

No. Determining the precise location of your station is done by the validation procedures in the onocoy system.

#### How does onocoy prevent fraudulent correction streams?

Fraudulent streams are streams which do not originate from a physical antenna and GNSS receiver. The onocoy system implements sophisticated methods to detect fraudulent streams and detects synthetically generated streams such as

* Network RTK “Blended” streams
* Duplicate injection of streams
* RF based synthetic streams.

These methods include, but are not limited to

* Regular data consistency checks over mid-term periods
* Regular checks to validate data consistency with streams in the same area
* Real-time supervision / monitoring / alerting
* Regular checks over long-term periods to validate data consistency with meteorological data.

The consequence of injecting fraudulent streams will be a banning of the user account and a slashing of all unclaimed rewards.

#### Can I provide data from a 3rd party service, such as public networks like IGS or other publicly or privately owned networks?

With the acceptance of the terms and conditions, a prerequisite when signing up to the onocoy console, you confirm that you have the rights to provide such streams. If you have the approval of the provider of the data source to redistribute the data and get rewards for doing so (i.e. commercial use), then you are welcome to provide those data streams to onocoy.

Please note that multiple submissions of the same streams, e.g. from free or public networks such as IGS or RTK2GO, even when done by separate users in the onocoy platform, will result in banning.

Should you be the original provider of a data stream, and you are banned because potentially somebody else is already providing your data into the onocoy system, please [contact us](mailto:support@onocoy.com).

#### My station frequently disconnects. What can I do?

Our team is aware of this issue and we can say that this is **not related to any specific miner or hardware.** One reason is that we are currently rolling out updates several times a day which does result in the connections being reset. There are further things we're observing in the backend that might cause connections to be re-established.

Generally though, this should not affect operations, usage or rewarding, as the device would reconnect within a few seconds

There's nothing that needs to be done on your network side, as the TCP connection from your device is solely outbound, hence it traverses typical NAT and firewall setups without a problem.

#### I have privacy concerns. Is the precise location of my device/antenna disclosed?

Onocoy is taking your privacy seriously, by not revealing the precise location of your antenna. The precision of the latitude/longitude position is rounded and the circle showing the location is deliberately not exact. However, as the true centimeter precise location of the antenna is mandatory information for clients using this stream, this information is embedded in the data sent to the client.

### Rewards

#### Why are my rewards not as high as expected?

Here are a few steps to analyze for you.

Start with checking the Base reward chart of your server device, look at Location Scale, Quality Scale and Availablity Scale. These numbers are updated once per day, and represent the cumulated statistics of the day before.

* Low Location scale

If Location Scale is lower than 1, then this means that there are 3 or more neighbors in your vicinity, which will result in downgrades for everyone. For the exact way how the location scale is determined, check the [whitepaper](https://www.onocoy.com/s/20230825_whitepaper_onocoy_final.pdf), chapter 4.2.2.

* Low Quality Scale

Check your receiver, antenna setup, signal levels, messages sent etc. For your stream, you can also open the "Live view" window and get a real-time view on Satellite visibility and color coded signal levels.

* Low Availability scale

Your receiver has prolonged times of being disconnected. Look at the Connection History.

Short interruptions DO NOT have an impact on availability scale, even if they are frequent. Interruptions can happen for many reasons, including us updating the backend, maintenance, device failures, ISP failures etc. Your device - if configured well enough - will automatically reconnect after a few seconds.

Look for the disconnect reasons in the connection history log. Things like Device reconnected or Device disconnected, as well as No or invalid data indicate that the issue is not on onocoy's side.

If the IP number changes from one connection to the next, then this is very likely due to your Internet connectivity or your ISP. \[Please note that the port number, i.e. the number after the ":" will always change from one connection to the next]

If the IP number does not change from one connection to the next, then try to ping the device in your LAN/WLAN with tools like ping or mtr.

#### My wallet is not connecting. What can I do?

We recommend to connect your wallet using Chrome or Brave Browser on a Desktop device. Follow the instructions [here](https://docs.onocoy.com/documentation/3.-become-a-miner/4.-receive-rewards#connect-your-wallet) to link your wallet to onocoy. If you still have trouble connecting your wallet, don't hesitate to [contact us](mailto:support@onocoy.com).

#### How is the location scale calculated?

There are three factors for the calculation of the location scale:

* How many other stations there are within a certain radius;
* How far away each of these stations are;
* The quality of the neighboring stations. A neighbor with low quality only leads to a small reduction in rewards.

The nearest two stations do not reduce your location scale, as it represents desired redundancy. You can check the surrounding stations in our explorer map.

Check out the details in [this subpage](https://docs.onocoy.com/documentation/mining-rewards-breakdown/location-scale) or in our [whitepaper](https://www.onocoy.com/s/20230825_whitepaper_onocoy_final.pdf), chapter 4.2.2.

#### How much will I earn streaming RTK correction data to onocoy?

It depends on numerous factors. The number of signals, satellites, and your location play an important role here. However, while the design of our macroeconomic incentive scheme is quite mature, we haven't decided on specific numbers yet. The token is not yet listed, though one will soon be able to earn the token even before it lists.

To find more information, check out the [Reward calculation](https://docs.onocoy.com/documentation/8.-faq-troubleshooting/broken-reference) page.

#### Why does onocoy use blockchain technology?

<figure><img src="https://3173123995-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FjBN41DfVchs8L33Unu18%2Fuploads%2Fgit-blob-37fcdcd64e1f7fb3d9431f95457d39a76ed01d89%2Fimage.png?alt=media" alt=""><figcaption></figcaption></figure>

#### If the rewards received from miners are immediately exchanged for FIAT, the token price must drop. How is this mitigated/addressed?

There are several possible answers to this question. We [have mathematically shown](https://blog.uros.kalabic.rs/adequate-burn-and-mint-rewards) that rational token holders will only sell a specific amount of tokens per time step in order to receive maximum returns in FIAT. If a token holder is irrational and sells more, a rational token holder would buy those tokens, thus stabilizing the price.

In general, the selling of tokens by miners is a downward pressure on the token price that is expected in our crypto-economic design. Several upward pressure mechanisms stabilize this downward pressure:

1. Tokens are required by users to access correction data streams
2. Constant burn of token units, thus reducing the available supply
3. The requirement to lock tokens in order to access governance (voting power is proportional to the locked ONOs)
4. A maximum supply of 810 Million ONOs
5. A staking function

#### **How do I claim my rewards?**

Once available, you can claim your incoming rewards. This is done by clicking the *Claim Rewards* button in your NTRIP server list. You can review your current balance in the upper right corner of the validator.

Check out the detailed description how to claim rewards in [this section](https://docs.onocoy.com/documentation/3.-become-a-miner/4.-receive-rewards#claim-rewards) of Receiving rewards.

### Receiving a Correction Stream

#### **The position provided by my onocoy enabled RTK rover doesn't match my expectation, there is a shift in position, in what datum is the position provided?**

Short answer: the datum Onocoy base stations coordinates are provided in the NTRIP RTCM streams is ITRF2020, IGS2020 or WGS84 G2296 datums (all those are equivalent to each other for practical purposes), this means that if your RTK rover is setup without any transformations it will also deliver its position in those datums while using onocoy base stations.

Long answer: please [see here](https://docs.onocoy.com/documentation/8.-faq-troubleshooting/frequently-asked-questions/explaining-datum-shifts).
