# Quality Scale

The Quality Scale represents the quality of the data from a base station that is sent to the onocoy system. The grading system is based on clients' needs and combines multiple parameters into one Quality Scale score.

The overall Quality Scale is the product of the three factors constellation reward, band reward and signal quality reward.

```
Quality Scale = constellation reward * band reward * signal quality reward
```

## Constellation reward

The constellation reward grades a base station regarding the featured GNSS constellations. It is the sum of each  supported constellations factor.  GLONASS is down-weighted and regional systems (IRNSS, QZSS) are not considered.

| Constellation | Weight | Factor |
| ------------- | ------ | ------ |
| GPS           | 1      | 0.286  |
| GLONASS       | 0.5    | 0.142  |
| Galileo       | 1      | 0.286  |
| BDS           | 1      | 0.286  |
| QZSS          | 0      | 0      |
| IRNSS         | 0      | 0      |

**Example** Base station A features the constellations GPS, Galileo, BDS and QZSS. The resulting constellation reward is

```
Constellation reward = 0.286 (GPS) + 0.286 (Galileo) + 0.286 (BDS) + 0 (QZSS) = 0.858
```

## Band reward

The band reward grades a base station regarding the featured frequency bands. It is determined by a maximum number of different frequency bands tracked on a constellation.&#x20;

| Number of bands | Scale factor | Description                               |
| --------------- | ------------ | ----------------------------------------- |
| 1               | 0.08         | L1 (typically), but could also be L5 only |
| 2               | 0.32         | L1/L2 or L1/L5                            |
| 3               | 0.80         | L1/L2/L5                                  |
| 4               | 0.95         | L1/L2/L5/L6                               |
| 5               | 1.0          | Five frequency receivers.                 |

The fifth frequency is considered to be the Galileo E5 AltBOC signal, displayed as E5ab in the onocoy explorer.

**Example** The receiver from base station A offers the frequencies GPS L1/L2/L5 and Galileo E1/E5b/E5a/E5ab/E6 as well as BDS B1I/B2I/B3I/B1C/B2a/B2b/B3. It is hence considered as a quadruple-frequency receiver.

```
Band reward = 0.95 (quadruple band)
```

## Signal quality reward

The signal quality now represents the quality of the actual electromagnetic signal that is being received and sent to the onocoy system. We calculate the average square of these four parameters:

* **Root Mean Square (RMS) Code:** The RMS Code represents the noise of the code signal and is calculated from the Multipath Linear Combination. It factors in how much the surroundings of the base station cause the signal to be interfered. The lower the RMS, the better the quality.
* **RMS Phase:** The RMS Phase represents the carrier phase noise of the signal. It is calculated from a de-trended Geometry Free Linear Combination. The lower the RMS, the better the quality.
* **Cycle slip ratio:** The cycle slips ratio is the ratio between the number of detected cycle slips and the total number of measurements. A cycle slip is a temporary loss of lock in the receiver and can cause losing a fix at the rover receiver. The smaller the ratio, the better the quality.
* **Sky visibility:** The sky visibility represents the ratio between the number of observed satellites and the number of theoretically possible satellites based on the satellites' orbits. Satellites close to the horizon (below 10° elevation) are excluded from this analysis. Take a look at [your sky view in the explorer](https://console.onocoy.com/servers) to monitor your sky visibility. The higher the visibility, the better the score.

Each parameter will be measured and then converted into a score, based on a mapping function. To get an idea of the relationship between measurement and score, take a look at the following table.&#x20;

Read the table like this: *To get a score of 0.99 or higher, the code RMS needs to be 0.14 m or lower.*&#x20;

| Parameter                                                               | 0.80     | 0.90      | 0.99+      |
| ----------------------------------------------------------------------- | -------- | --------- | ---------- |
| **Cycle-slip occurrence**                                               | 1 in 150 | 1 in 1000 | <1 in 2300 |
| **Pseudorange noise (Code RMS)**                                        | 0.4 m    | 0.28 m    | <0.14 m    |
| **Carrier Phase noise (Phase RMS)**                                     | 0.004 m  | 0.0028 m  | <0.0014 m  |
| **Sky visibility (% of tracked satellites with elevation > 7 degrees)** | 80%      | 90%       | >99%       |

Additional components of the signal quality are planned to be added in order to improve the quality assessment of both the device and the installation.

**Example** Let's assume base station A gets the following scores:

```
RMS Code = 0.92
RMS Phase = 0.95
Cycle slip ratio = 0.98
Sky visibility = 0.67
```

The resulting signal quality results to, using the average square

$$
\text{SignalQuality} = \frac{\text{RMSCode}^2 + \text{RMSPhase}^2 + \text{CycleSlipRatio}^2 + \text{SkyVisibility}^2}{4}=0.79
$$

**Example** Taking all the values above, the overall Quality Scale for base station A then is

```
Quality scale = 0.858 (constellation reward) 
                * 0.95 (band reward) 
                * 0.79 (signal quality reward)
              = 0.64  
```

The overall Quality Scale of 0.64 will then be combined with the Location Scale and Availability Scale to calculate the final rewards.
