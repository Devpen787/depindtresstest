# Mining rewards breakdown

<figure><img src="https://3173123995-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FjBN41DfVchs8L33Unu18%2Fuploads%2FyzXH0Ko8s0glsKlWHzO5%2FBaseReward_bg_removed.png?alt=media&#x26;token=546d1ff8-279a-4597-ae0a-ef83cf55f5d3" alt=""><figcaption><p>Total rewards breakdown</p></figcaption></figure>

<table><thead><tr><th width="143.10546875">Reward</th><th width="122.0546875">Type</th><th width="151.8359375">Scales with</th><th>Purpose</th><th>Remarks</th></tr></thead><tbody><tr><td>Base Reward</td><td>Performance</td><td>Station performance</td><td>Cover station operating costs</td><td>Independent of data usage</td></tr><tr><td>Streak Appreciation</td><td>Performance</td><td>Data availability and quality</td><td>Incentivizes good long-term performance</td><td>50% adder to base reward, infinite runtime</td></tr><tr><td>High Value Area (HVA)</td><td>Performance</td><td>Importance of new installation</td><td>Rapid installation of stations in areas with high user demand</td><td>Adder to base reward, time limited</td></tr><tr><td>Usage Rewards</td><td>Usage</td><td>Data usage in vicinity of station</td><td>Provides upside potential for station owner and motivates local community to create demand</td><td>Will become the dominant form of rewards in the future</td></tr></tbody></table>

onocoy's **mining rewards** system is designed to incentivize both the **rollout** and **maintenance** of GNSS reference stations (called miners). The reward model includes **four components**, each based on different performance and network factors:

### **1. Base Reward**

Every miner gets a **base reward** (in ONO) for participating—this is **independent of actual usage** and encourages early infrastructure deployment.

**Components of Base Reward:**

* **Daily ONO Base Reward**:
  * Determined by the *rewards commission*
  * Indicates the maximum amount of ONO a miner can earn within the Base Reward
  * Will be multiplied by the following factors:
* [**Quality Scale**](https://docs.onocoy.com/documentation/mining-rewards-breakdown/quality-scale):&#x20;
  * onocoy checks the quality of the submitted data daily
  * The quality is based on:
    * Supported GNSS constellations (e.g., GPS, Galileo, BeiDou, etc.)
    * Frequency bands supported (e.g., L1, L2, L5, L6)
    * Measurement metrics (e.g., cycle-slip-free epochs, signal noise)
* [**Availability Scale**](https://docs.onocoy.com/documentation/mining-rewards-breakdown/availability-scale):
  * Data uptime and completeness
  * Uptime must be ≥80% to earn any reward; scaling is exponential up to 100%
* [**Location Scale**](https://docs.onocoy.com/documentation/mining-rewards-breakdown/location-scale):
  * Rewards optimal distribution (not clustered)
  * Penalties for redundancy over three stations within 15–50 km radius
  * Rewards sparsely covered areas to encourage useful deployments
* **Early Mover Boost**:
  * Multiplier (initially 5×) applied to early adopters
  * Declines over time

***

### [**2.** Streak Appreciation](https://docs.onocoy.com/documentation/bonus-programs/streak-appreciation)

Additional incentives to:

* Reward early adoption
* Keep up high performance
* Drive infrastructure upgrades

***

### **3.** High Value Areas

Additional incentives (temporary) to:

* Support targeted network growth
* Deploy new stations quickly in a highly demanded area

***

### **4. Usage Rewards**

This is a **bonus based on actual data consumption** in a region. It is currently planned for the future and not active yet.

* Shared among miners in a region based on:
  * How often their data is accessed
  * The **improvement their data offers** to users (e.g., signal quality)
* Encourages regional collaboration: miners benefit **more if the region is actively used**.

Goal: Encourage miners to not just deploy anywhere, but to find **high-impact, high-use** locations.

***

### Reward System Summary

<figure><picture><source srcset="https://3173123995-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FjBN41DfVchs8L33Unu18%2Fuploads%2FBV5xFJWnunDTv1e695AB%2FBreak_down_of_miner_rewards_no%20lines%20dark.png?alt=media&#x26;token=7cfeaca3-b7e0-445a-96d3-3d171efb2395" media="(prefers-color-scheme: dark)"><img src="https://3173123995-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FjBN41DfVchs8L33Unu18%2Fuploads%2Fd3StKhUtdJDhYZJkEusS%2FBreak_down_of_miner_rewards_no%20lines%20light.png?alt=media&#x26;token=d44a88d0-aa2e-4c55-8cfd-e50164ea2e2b" alt=""></picture><figcaption></figcaption></figure>

This graph shows a summary of all the reward components and its magnitude.&#x20;
