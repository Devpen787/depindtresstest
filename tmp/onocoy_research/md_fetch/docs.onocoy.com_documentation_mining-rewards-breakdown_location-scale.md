# Location Scale

This page offers a detailed explanation of the location scale and its calculation. If you prefer a video tutorial, you can watch Lucy explain the basic principles in this Youtube video.

{% embed url="<https://youtu.be/HFKnkM5yZlQ?feature=shared>" %}

### General ideas

The location scale is one of the multipliers to calculate a station's reward. Its goal is to distribute rewards in areas with a high number of base stations.

It is a number between 1 and 0, obtained after multiplying all the reduction factors ($$RF$$) of its neighbor stations within a 50km radius.&#x20;

The base stations are grouped by their IP of origin. That means if three stations belong to the same owner, they form one group. If another owner has just one station, it is another group. Your own stations are never grouped.&#x20;

For the station location scale calculation we only take in to consideration the base station that has the highest impact out of each group. All the other stations from this group are ignored.

The neighboring stations $$i=1\ldots n$$ which are not ignored are sorted by distance to your own station.

$$
LocationScale = {RF}\_1 \cdot RF\_2 \cdot \ldots \cdot RF\_n
$$

A location scale of 1 will mean you get full rewards regarding the location, a location scale of 0 means you will get no rewards regarding our location.

Each Reduction Factor $$RF$$ is a function of the distance and the quality of the stream so that:

* The further away a neighbor is, the lower the distance penalty ($$DP$$).
* The higher your signal quality and availability compared to that of your neighbors, the higher your share of the rewards. A Share Factor ($$SF$$) is calculated for each of the neighbors. This means that a low quality stream does not heavily affect the rewards of high quality streams. It is still profitable to install a high quality base station in an area already covered by low quality base stations.

$$
RF\_i=1-(DP\_i\cdot SF\_i)
$$

* The two stations with the biggest impact will not affect your location scale, which is to promote redundancy.

### Distance Penalty ($$DP$$)

For each neighboring station, a Distance Penalty will be calculated. The distance penalty of each neighboring base station is defined using the following rules:

1. The stations are grouped from neighbor networks and only consider the one with the highest impact for location scale calculation.
2. The two closest base stations are ignored, because we want to incentivize network redundancy
3. Stations within 15 kilometers from your own base station will have a distance penalty of 1
4. The distance penalty for stations located between 15 and 50 kilometers declines quadratically from 1 to 0, where at 15 km it is 1 and at 50 km is 0
5. Stations further away than 50 kilometers are ignored

The equation for the Distance Penalty between 15 and 50 km is

$$
DP = (1-\frac{DistanceToStation - 15 \text{km}}{50\text{km} - 15 \text{km}})^2
$$

This plot shows the Distance Penalty in a graph. The first two stations are ignored, hence the graph will only apply to those stations after the first 2. Between 15 and 50 km, the quadratic decline applies.

<figure><img src="https://3173123995-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FjBN41DfVchs8L33Unu18%2Fuploads%2Fxy1NSXcP2HNb1p0RhlYS%2FGraphBlank.png?alt=media&#x26;token=f91a616d-0e9e-43db-b43d-11a52e151060" alt=""><figcaption><p>Graphical display of the Distance Penalty (DP). The farther the neighbor, the lower the distance penalty.</p></figcaption></figure>

### Share Factor ($$SF$$)

Similarly, for each neighboring station, a Share Factor is calculated. It is taking into account the signal quality and the availability (Qual factor) of each station:

$$
SF=\frac{Qual\_{\text{Neighbor}}}{Qual\_{\text{Neighbor}} + Qual\_{\text{Your Station}}}
$$

### An example

Let’s look at a practical example of how the location scale is calculated for each station.

This is the widget displayed in your *Reference Stations* tab. On the right side of the map, we can see your exemplary base station, in green color, surrounded by 3 third party base stations scattered through the surrounding land, in purple color.

<figure><img src="https://3173123995-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FjBN41DfVchs8L33Unu18%2Fuploads%2FIlnwO8QjLDbhyTM5idZc%2FAllNeighborsNew.png?alt=media&#x26;token=5e1db641-7e63-479d-98c4-005d1d3d4994" alt=""><figcaption><p>Find this map of neighbors in your <em>Reference Stations</em> tab.</p></figcaption></figure>

Next to your exemplary base station, we can click on each of the four neighboring stations to get the details.

<figure><img src="https://3173123995-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FjBN41DfVchs8L33Unu18%2Fuploads%2FsgANUbxA0aNkVrpyxWo2%2FCollectionNeighbors.png?alt=media&#x26;token=4ade59c8-8199-445a-9ae6-c7e25f05f36f" alt=""><figcaption><p>The first two stations are ignored. The third neighbor's reduction factor, Qual factor and distance to the example station is shown</p></figcaption></figure>

#### Calculating Reduction Factors ($$RF$$)

If we sort the neighboring stations simply by the distance to your own station, we can create a plot showing the relation between the distance and the distance penalty $$DP$$:

<figure><img src="https://3173123995-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FjBN41DfVchs8L33Unu18%2Fuploads%2FN6GKrwBe810nDGQsCXWE%2FGraphsStationsOnIt.png?alt=media&#x26;token=5e073025-6d5b-4588-951c-007065c37091" alt=""><figcaption></figcaption></figure>

The dashed gray line represents the quadratic function so that you can see the behavior of the penalty as a function of the distance.

In this example, the distance penalties have been scaled up from 0% to 100% but for the calculation purposes the punctuations range from 0 to 1.

Let's take station ESPBARSAB4 as an example and calculate $$DP$$, $$SF$$  and $$RF$$.&#x20;

ESPBARSAB4 has  $$Qual\_{\text ESPBARSAB4} = 0.934$$ and a distance to your exemplary station of 25.522 km. In comparison, $$Qual\_{\text Your Station} = 0.99$$.

As picked from the graph,

$$
DP\_{\text{ESPBARSAB4}} = (1-\frac{DistanceToStation - 15 \text{km}}{50\text{km} - 15 \text{km}})^2=0.489
$$

Next, we calculate $$SF$$  and $$RF$$.&#x20;

$$
SF\_\text{ESPBARSAB4}=\frac{0.934}{0.934+0.99}=0.485
$$

$$
RF\_\text{ESPBARSAB4}=1-(0.489\cdot 0.485)=0.763
$$

This process is repeated for all stations between 15 and 50 km radius:

<figure><img src="https://3173123995-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FjBN41DfVchs8L33Unu18%2Fuploads%2FxDUFNtIwKy1Tzre4m3Mj%2FCaptura%20de%20pantalla%202025-04-17%20220536.png?alt=media&#x26;token=89188c11-faa3-49b3-908f-e4186f2b4ad6" alt=""><figcaption></figcaption></figure>

Now we can calculate your station's final Location scale by multiplying all the Reduction Factors. As ESPBARSAB4 is the only station in 50 km range that is not ignored, the Location Scale is simply

$$
LocationScale=0.763
$$

This Location Scale factor will then be used for the multiplication with the other reward factors, resulting in your total Reward Scale.
