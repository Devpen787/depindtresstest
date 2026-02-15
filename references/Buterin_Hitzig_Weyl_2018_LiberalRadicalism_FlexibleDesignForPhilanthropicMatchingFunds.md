# Buterin_Hitzig_Weyl_2018_LiberalRadicalism_FlexibleDesignForPhilanthropicMatchingFunds.pdf

## Page 1

Liberal Radicalism:
A Flexible Design For Philanthropic Matching Funds∗
Vitalik Buterin†, Zoë Hitzig‡ and E. Glen Weyl§
December 2018
Abstract
We propose a design for philanthropic or publicly-funded seeding to allow (near) optimal
provision of a decentralized, self-organizing ecosystem of public goods. The concept extends
ideas from Quadratic Voting to a funding mechanism for endogenous community formation.
Citizens make public goods contributions to projects of value to them. The amount received
by the project is (proportional to) the square of the sum of the square roots of contributions
received. Under the “standard model” this yields ﬁrst best public goods provision. Variations
can limit the cost, help protect against collusion and aid coordination. We discuss applications
to campaign ﬁnance, open source software ecosystems, news media ﬁnance and urban public
projects. More broadly, we relate our mechanism to political theory, discussing how this solu-
tion to the public goods problem may furnish neutral and non-authoritarian rules for society
that nonetheless support collective organization.
§1 Introduction
In many contexts, a sponsor with capital wishes to stimulate and support the creation of public
goods but is ill-informed about the appropriate goods to create. Thus, such a sponsor may want
to delegate this allocation to a decentralized market process. Examples of these contexts include
campaign ﬁnance, funding open source software (such as blockchain communities, public or char-
itable support for news media and the funding of intraurban public projects). Recent work on the
theory of Quadratic Voting (henceforth QV; see Posner and Weyl, 2017 for a survey) suggests that
near-optimal collective decision-making may be feasible in practice, but relies on an assumption
of a ﬁxed set of communities and public goods that is inappropriate to this context. In this paper
we propose an extension of the logic of QV to this setting.
The basic problem we address can be seen by comparing two extreme ways of funding such
a ecosystem, both of which are problematic. On the one hand, a simple private contributory
system famously leads to the under-provision of public goods that beneﬁt many people because
of the free-rider problem (Samuelson, 1954). The larger is the number of people the beneﬁt is split
amongst, the greater is the proportional under-provision. Conversely, a system based purely on
membership or on some other one-person-one-vote (1p1v) system cannot reﬂect how important
∗Glen dedicates this paper to Kwame Anthony Appiah, who ﬁrst introduced him to the liberal-communitarian
debate and whose struggle to reconcile neutrality and ﬂexibility with a commitment to community is the spirit guiding
our analysis. We are grateful to Julian Gewirtz, Atif Mian, Danny Erickson and Eric Posner for useful comments and to
Avital Balwit and Charlie Thompson for excellent research assistance.
†Ethereum Foundation, http://vitalik.ca, vitalik.buterin@ethereum.org.
‡Harvard University, http://scholar.harvard.edu/hitzig, zhitzig@g.harvard.edu
§Microsoft Corporation and Princeton University, http://www.glenweyl.com, weyl@princeton.edu.
1
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 2

various goods are to individuals and will tend to suppress smaller organizations of great value.
We aim to create a system that is as ﬂexible and responsive as the market, but avoids free-rider
problems.
Our solution is to modify the funding principle underlying the market to make it nonlinear.
In a standard linear private market, the funding received by a provider is the sum of the con-
tributions made by the funders. In our “Liberal Radical” (LR) mechanism, the funding received
by a provider is the square of the sum of the square roots of the contributions made by the fun-
ders. Holding ﬁxed contribution amounts, funding thus grows with the square of the number of
members. However, small contributions are heavily subsidized (as these are the most likely to be
distorted by free-riding incentives) while large ones are least subsidized, as these are more like
private goods. Under the standard selﬁsh, independent, private values, quasi-linear utility frame-
work, our mechanism leads to the utilitarian optimal provision of a self-organizing ecosystem of
public goods. In addition, our solution has a connection to Kant (1785)’s categorical imperative: it
is the only mechanism such that individuals are incented to contribute as if all others contributed
as they did.
While our funding principle may seem strange, existing systems such as matching funds for
infrastructure projects, political campaigns, charitable contributions, and other public goods aim
to capture similar beneﬁts, but do so in an unsystematic way. For example, a variety of public
goods are funded through matching programs, whereby an institutional body (a government,
corporation, political party, etc.) matches individual contributions either 1:1 or in some other
ratio. For example, New York City matches small contributions to campaigns for elected ofﬁce
(city council, mayor, comptroller, public advocate), matching contributions 6:1 and up to $ 175.
Many corporations use similar rules: one of our employers matches charitable contributions by
all full-time employees up to $ 15,000 a year. Doing so ampliﬁes small contributions, incents
more contributions and greater diversity in potential contributors, and confers a greater degree of
inﬂuence on individuals in determining ultimate funding allocations.
Matching programs are not only common in public and charitable funding, but also follow an
intuitive logic that has built a variety of public policies. Indeed, the very idea of tax deductibil-
ity for charitable contributions is a form of governmental matching. But while matching funds
share the spirit of our funding principle, they lack a systematic design, and set the funding ratios
and maximums in arbitrary ways. The LR mechanism can be seen as offering a coherent design
that captures their central motivation in a mechanism that is (approximately) optimal from the
perspective of economic theory.
This paper is written in a manner that is unusual today. It combines formal economic and
mathematical logic, detailed practical considerations and short discussion of the normative polit-
ical philosophy around our proposals. We see formal rules derived from mechanism design, but
interpreted through the lens of philosophical concerns and designed with an eye towards secu-
rity and user interface, as offering radical and yet realistic templates for solutions to large-scale
practical problems, as well as novel conceptual possibilities for social and political life.
We understand that this mixture will be disorienting to many of our readers and that not all
parts of this paper will be interesting or digestible to each audience we aim to reach. We therefore
now provide a roadmap that should help readers determine where to focus their attention.
We begin the paper in §2 by providing more detail on the background and motivation above.
We then develop a simple but general mathematical model in §3 of public good provision and
use it to illustrate the failures of both the market system (Bergstrom et al., 1986) and 1p1v (Bowen,
1943). Then in §4, we describe LR formally and show mathematically that it leads to optimal public
goods provision. We then turn, in §5, to a variety of variations and extensions that enrich the range
of applicability and our understanding of LR. These three sections are quite mathematical and are
2
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 3

likely to be relevant to those with more formal training.
Having developed this apparatus, we change gears in §6 to describing a range of applications,
with attention to special characteristics of each case and how LR, despite its somewhat exotic
nature, matches qualitative features of previous solutions while more smoothly covering a wider
range of cases and problems. This section is widely accessible and likely to be of most interest to
entrepreneurs and policymakers interested in applying the ideas.
We conclude the paper on a more abstract and philosophical note. In §7 we sketch how our
formal analysis of the public goods problem speaks to broader, more fundamental issues in liberal
political theory. The LR mechanism, we suggest, may pave the way toward a broader We ground
this philosophy in the history of liberal ideas and highlight its many precedents. §8 concludes by
discussing directions for future research and implications for the future of governance.
§2 Background
2.1 Public Goods Problems
One of the most fundamental problems in political economy is variously known as the “free-
rider”, “collective action” or “public goods” problem; we will use the term “public goods”. All
these refer to cases where individuals can or do receive beneﬁts from shared resources and invest-
ments that may be more valuable than the contribution they individually make to those shared
resources, which cannot be efﬁciently priced due to the expense or inefﬁciency involved in ex-
cluding individuals from access. While the term public goods is sometimes used by economists
to refer to a particularly extreme case, we are interested in a broader set of activities. By “public
good" we refer to any activity with increasing returns in the sense that the socially efﬁcient price to
charge for the activity (marginal cost) is signiﬁcantly below the average cost of creating the good.
Seen in this broader light, public goods are core to civilization, which could not exist unless
the whole were great than the sum of its parts. Contemporary economic thought has increasingly
emphasized the centrality of increasing returns, especially through investment in innovation and
knowledge, to development, beginning with the work of Romer (1986). As the exploding lit-
erature on agglomeration and spatial economics emphasizes, the cities that literally created the
idea of middle classes (viz. bourgeoisie) and the citizen could not exist without increasing returns
(Krugman, 1991). Yet, despite this centrality, classical capitalism deals poorly with such activities.
Because each individual, if she acts selﬁshly, only accounts for the beneﬁts she receives and not
the beneﬁts to all other individuals, funding levels will not scale with the number of individual
beneﬁciaries as would be desirable.
Because public goods are such an omnipresent concern in modern capitalism, a range of in-
stitutions have emerged to address this problem. The most canonical and perhaps the most im-
portant is the contemporary democratic nation state. Such states use taxation and voting-based
governance systems to determine how much and which public goods should be provided. The
other most prevalent method for addressing public goods is converting them to private goods by
imposing technologies (e.g. digital rights management for information or walls and fee collectors
at parks) that allow individuals to be excluded. The ﬁnal mechanism is using moral, cultural,
religious or social motives to induce individuals to contribute to charitable providers of public
goods. Some intermediate institutions mix elements of these three ideal types. One example is a
local government with some ability to exclude, which citizens can move across at some cost and to
which they have some loyalty (and thus often donate their time). Another example is an exclusive
but not-for proﬁt club.
3
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 4

Unfortunately, all of these mechanisms have fairly severe limitations. 1p1v democratic sys-
tems (even when they work appropriately) respond to the will of the majority, not necessarily to
what would create the greatest overall value. They often oppress minorities or are subverted by
minorities to avoid such oppression. They are also extremely costly to set up, rigid and do not
easily adapt to demands for different and new levels of organization. Private (usually corporate)
exclusion-based efforts are, while more ﬂexible, usually cumbersome and costly to impose, often
lack effective feedback mechanisms that ensure they serve the interests of their members and, per-
haps most importantly, inefﬁciently exclude potential users. Charitable organizations often are
more responsive and ﬂexible than either of the other forms, but rely on motives that seem to be
difﬁcult to closely align reliably with the common good outside of the relatively small groups in
which they are often very effective (Ostrom, 1990). Outside such groups the often instead get
captured by status motivations and parochial, even exclusionary, interests.1
2.2 Literature
Clarke (1971) and Groves (1973), recasting the insights of Vickrey (1961), proposed a solution to
the collective action problem, in the form of a rather complex mechanism for individuals to reveal
their preferences over public goods to a government or other central clearinghouse to overcome
the rigidity and inefﬁciency of majority rule. Unfortunately, this system is extremely fragile to
collusion and very risky for participants in a way that most analysts have concluded makes it
impractical (Rothkopf, 2007).
Recently, however, more practical mechanisms have emerged for near-optimal collective decision-
making. Groves and Ledyard (1977) and Hylland and Zeckhauser (1979) both suggested a quadratic
mechanism for determining the level of continuous public goods, but their methods require either
a centralized iterative process or depend heavily on an unrealistic assumption of complete infor-
mation. However, the basic insight of quadratic pricing of collective choices reemerged in Weyl
(2012)’s proposal for what he called “Quadratic Vote Buying”.
In particular, he proposed allowing individuals to buy votes, paying the square of the votes
they buy. He argued, and Lalley and Weyl (2018) rigorously proved, that under standard assump-
tions (similar to those we use below) in large populations this leads to approximately optimal
decisions on public goods. A variety of work has extended this idea to arguments for the approx-
imate efﬁciency of procedures like this, which are broadly called Quadratic Voting (QV), under a
range of other settings and shown they may be applied well beyond simple, binary votes. Posner
and Weyl (2017) survey this work.
However, while QV addresses the inefﬁciency of standard 1p1v voting systems for agiven set of
decisions and collectives, it doesn’t solve the problem of ﬂexibility. That is, it does not allow the set of
public goods to emerge from a society organically, and effectively assumes a previously-speciﬁed
organizational structure that has to be taken as an assumption or imposed by an authority. In this
paper we try to extend the ideas around QV to address this limitation.
§3 Model
We develop a ﬂexible model for a society choosing which public goods to fund. Consider a society
ofN citizensi = 1,...N ; we take as an assumption throughout what follows that we can veriﬁably
distinguish among and identify these citizens, though we will discuss the possibility that they
1See Reich (2018) for a discussion of these issues in the context of contemporary American capitalism.
4
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 5

may collude (see §5.2 below). We use the term “society” to refer to the set of all participants and
the word “community” to refer to groups that fund a particular public good; however, in many
applications, the relevant “society” is itself a community within a broader setting.
There is a set of potential public goods P . We do not make any assumption about the nature
of this set (there may be some measure theoretic questions for some cardinalities of the set, but we
will ignore these). In particular, there is no sense in which the set of public goods need be speciﬁed
externally or in advance; any citizen may at any time propose a new public good. We denote a
typical public goodp∈P .
3.1 Individual preferences and actions
LetVp
i (Fp) be the currency-equivalent utility citizeni receives if the funding level of public good
p isFp. We assume all public goods generate independent value to citizens (no interactions across
public goods) and that citizens have quasi-linear utility denominated in units of currency. We
also assume a setting of complete information, though given the ﬂexible set up of the problem,
our results do not rely heavily on this assumption. We also abstract away from issues about
observability and timing of contributions.
Our interest here is in maximization of dollar-equivalent value rather than achieving an equi-
table distribution of value (we assume that an equitable distribution of basic resources has been
achieved in some other manner, such as an equal initial distribution of resources). For purposes
of simplifying the analysis below, we assume all functionsVp
i are concave, smooth and increasing.
Absent these assumptions some complications may arise (as we return to in §5.6) but are sufﬁ-
ciently minor and tangential to the main argument that it is easier to abstract from them for the
moment.
Each citizeni can make contributions to the funding of each public goodp out of her personal
resourcescp
i . The total utility of citizeni is then
∑
p
Vp
i (Fp)−cp
i−ti (1)
whereti is a tax imposed on individual i. In this framework, different funding mechanisms for
public goods are different formulae for relating{Fp}p to{cp
i}p
i , with any surplus or deﬁcit being
made up for by taxes that do not inﬂuence behavior.
3.2 Funding mechanisms
A funding mechanism in our ﬂexible public goods setting deﬁnes the total amount of funding
received for each good in the set P , given all individual contributions cp
i . Formally, a mechanism
is a mapping from the set of all individual contributions, i.e. vectors cp = (cp
1,cp
2,...,c p
N) where
subscripts index citizens. Thus, cp is a vector in R+N, and we denoteC|P| the space of all possible
collections of funding levels for each goodp given contributions from theN citizens, i.e.{cp}p∈P .
The set of all ﬁnal funding levels for all goods p ∈ P is the set F, which has |P| real-valued
elements F = (F 1,F 2,...,F |P|), with{Fp∈ R}.
Deﬁnition 1 (Funding Mechanisms) A funding mechanism Φ :C|P|→F determines the total level of
funding for each goodp∈P , such that Φ(cp
i ) ={Fp}p∈P .2
2In a slight abuse of notation, we will sometimes use Φ to refer to the subcomponent Φp which maps individual
contributions to good p into funding levels Fp for that particular good p.
5
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 6

Formally, budget balance requires that ∑
iti = ∑
p (Fp− ∑
icp
i ) (taxes make up for any deﬁcit
between individual contributions and total funding levels). Before studying such mechanisms,
however, we consider what social welfare maximization requires. Our analysis here is the special
case of Samuelson’s analysis in the case of quasi-linear utility.
3.3 Welfare and optimality
Given the simple set up of our model, welfare calculations are straightforward. Total social welfare
is
∑
p
(∑
i
Vp
i (Fp)
)
−Fp (2)
by the budget constraint. Let Vp (Fp)≡ ∑
iVp
i (Fp) be the total value all citizens derive from the
good.
Maximizing this over all weakly positive funding levels {Fp}p for all goods, given concavity
and smoothness of theV functions this is equivalent to toFp being 0 ifVp′ (0)≤ 1 or taking on the
unique value satisfying Vp′ = 1. That is, the total marginal value derived from the good should
equal 1.
Deﬁnition 2 (Optimality) For allp ifVp′(0)≤ 1, a funding mechanism Φ is optimal when Fp = 0. If
Vp′(0)> 1, a funding mechanism Φ is optimal whenVp′ = 1.
3.4 Suboptimal mechanisms
We now consider two suboptimal funding mechanisms. The ﬁrst, which we refer to as “Capital-
ism”, has the total contributions exactly equal to the sum of individual contributions, as analyzed
in Bergstrom et al. (1986). There is no centralized funding based on individual contributions, and
thus no need for taxes or transfers.
Deﬁnition 3 (Capitalism Mechanism) Under Capitalism,{Fp}p∈P = Φcap(cp
i ) ={∑
icp
i}p∈P .
Note that ti = 0 under Capitalism. This mechanism corresponds to the traditional formula
used for charitable giving; while there are sometimes public matching funds of a small magnitude,
these will not greatly change our conclusions, which closely follow the analysis of Bergstrom et
al.. In this case, every citizeni seeks to maximize, in determining her contribution to goodp
Vp
i

∑
j
cp
j

−cp
i. (3)
Proposition 4 (Suboptimality of Capitalism) The Capitalism mechanism Φcap is suboptimal.
Proof. Maximization requires (differentiating) that for any citizen i making a positive contri-
bution to goodp that
Vp′
i (Fp) = 1.
That is, the level funding must be such that a single citizen’smarginal value equals 1. Summing
across citizens, Vp′ = 1 only when cp
i > 0 for a single i, and cp
j for all j̸= i. When there is more
than one contribution to goodp, genericallyVp′> 1.
If a large set of citizens beneﬁt signiﬁcantly from a public good, this will typically lead to
severe underfunding. For example, if all citizens are homogeneous, this is equivalent to Vp′ =N,
6
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 7

or setting the total marginal utility of the good toN times the level it should be at. When citizens
have heterogeneous preferences, matters are even worse, at least from a distributive perspective:
only the single citizen who cares most on the margin about the good has any inﬂuence on its
provision. Matters are even more pessimistic if citizens can make negative contributions (privatize
public goods), as then the lowest valuation citizen determines the provision level.3
Another mechanism, which we will call “1p1v”, has majority voting decide whether to fund a
mechanism, and the mechanisms selected funded through taxes and transfers.
Deﬁnition 5 (1p1v Mechanism) The 1p1v Mechanism Φ1p1v satisﬁes
{Fp}p∈P = Φ1p1v(cp
i ) ={N· [MedianiVp′
i
(
FP )
= 1]}p∈P.
Clearly 1p1v does not lead to optimality, as the mean must be used in the above formula rather
than the median to recover Vp′ = 1 , as Bowen (1943) observed. Bergstrom (1979b) discussed
the situations under which the mean is likely to be a good approximation for the median, and
demonstrated the generic inefﬁciency of 1p1v type systems.
Proposition 6 (Suboptimality of 1p1v (Bergstrom, 1979b)) The 1p1v MechanismΦ1p1v does not guar-
antee optimal funding levels.
Proof. In order for Φ1p1v to recover optimal funding levels, it must be that∀p∈P ,
MedianiVp′
i
(
FP )
= 1
N
N∑
i=1
Vp′
i
(
FP )
. (4)
The fact that condition (4) implies efﬁcient funding follows from quasilinear utility (so thatVp′
i (Fp)
is monotone and decreasing). While there are some cases in which (4) will hold, as discussed in
Bowen (1943), it may be that
MedianiVp′
i
(
FP )
> 1
N
N∑
i=1
Vp′
i
(
FP )
(5)
or
MedianiVp′
i
(
FP )
< 1
N
N∑
i=1
Vp′
i
(
FP )
(6)
and thus, generically,φ1p1v is not always efﬁcient Bergstrom (1979b). Depending on whether (4),
(5), or (6) holds, it may be that: (i) Vp′ = 1, (ii)Vp′ < 1, or (iii)Vp′ > 1. That is φ1p1v may recover
optimal funding levels, or lead to over or under funding on the margin.
Public good funding levels will tend to be higher and probably more accurate than under
Capitalism, which is likely why most developed countries use democratic mechanisms for deter-
mining levels of public goods. However, clearly the median is often a poor approximation for
3Ackerman and Ayres (2002) suggest a system that sounds superﬁcially different from capitalism but will typically
lead to similar results. They suggest every citizen be compelled to give some ﬁxed amount to public goods (in fact,
they suggest funding this using progressive taxes, but from the efﬁciency perspective we take here these are basically
equivalent). If there is a constrained set of public goods, this may have some impact in raising overall funding levels, but
will not move things much towards optimality. But if there is a sufﬁciently rich set of goods, such that each individual
has a good that is equivalent to giving the money back to herself, this yields just the same result as capitalism: every
individual uses the money to pay herself back, unless she has the greatest value for the public good.
7
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 8

the mean, especially for goods of value to smaller communities or “entrepreneurial public goods”
where a small community has an idea for a public good that is not widely understood at the time
for funding. These may well receive no funding from democracy; this is an important reason why
most small communities are funded primarily by charity or Capitalism rather than 1p1v.
Some improvements are possible, depending on how the funding mechanisms are adjusted;
as Bergstrom (1979a,b) argued, if there is some reasonable proxy for which citizens will beneﬁt
most from a good and we can tax them for it, 1p1v democracy may yield reasonable outcomes
as everyone will then agree on whether a given good is desirable. But in this begs the question:
in this case any consensual mechanism will agree. Our goal is to ﬁnd appropriate funding level
without assuming such prior centralized knowledge.
§4 Design and Analysis
Consider the funding mechanism, which we refer to as the Liberal Radical (henceforth LR) mecha-
nism for reasons we discuss further in our conclusion.
Deﬁnition 7 (Liberal Radical Mechanism) The Liberal Radical Mechanism ΦLR(cp
i ) generates fund-
ingFp for each goodp∈P such thatFp =
(∑
i
√
cp
i
)2
.
For the moment, assume ΦLR is funded by the deﬁcit
∑
p


(∑
i
√
cp
i
)2
−
∑
i
ci

 (7)
being ﬁnanced by a per-capita tax on each citizen. We also will, for the moment, assume that
citizens ignore their impact on the budget and costs imposed by it. As we will see, whether this is
an innocuous assumption or not will depend on context; we discuss this in §4.5 below. However,
it is easiest to understand the logic without worrying about the deﬁcit.
4.1 Baseline analysis
Under this assumption, citizeni’s contribution to goodp will be chosen to maximize
Vp
i



∑
j
√
cp
j


2
−cp
i. (8)
Any positive contribution will thus have to satisfy
2Vp′
i (Fp)
(∑
j
√
cp
j
)
2
√
cp
i
= 1↔Vp′
i (Fp) =
√
cp
i
∑
j
√
cp
j
(9)
by differentiation.
Proposition 8 (Optimality of the Liberal Radical mechanism) The Liberal Radical mechanism is op-
timal in the sense thatVp′(FP ) = 1 for allp∈P .
8
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 9

Proof. Adding the expression in (9) across citizens yields Vp′ (Fp) = 1 . Thus, ΦLR satisﬁes opti-
mality.
It is easy to check that the conditions for any positive contribution being made are also optimal
(viz. precisely whenVp′> 1).
4.2 Connection to Kantian ethics
Perhaps a more intuitive way to derive LR comes from normative theory. A classic principle of
moral philosophy, especially in the Judeo-Christian tradition is that individuals should act in a
manner that is impartial to self-serving motives. Matthew (7:12) quotes Jesus as enjoining his
followers to “Do unto others as you would have them do unto you” and the Talmud (Shabbat 31a)
quotes Rabbi Hillel summarizing the teachings of the Torah as “That which is hateful to you do not
to your neighbor.” Kant (1785) famously formalized this precept in his “Categorical Imperative”
that individuals should “act only according to that maxim whereby you can, at the same time, will
that it should become a universal law".
The relevance of this principle to public good provision is quite direct. The standard logic of
free-riding is that each citizen imagines that she would be willing to contribute to a public good
if, by her doing so, everyone else would as well. For example, each citizen might be willing to
see her taxes increase by 1% to fund a public good, but be unwilling to contribute unilaterally. In
fact, Roemer (2010) has suggested that the right solution to the public good problem is to induce
a change in human behavior so that every citizen acts according to a “Kantian equilibrium”.
In a case where every citizen is symmetric, the appropriate application of the Kantian principle
seems simple enough: every citizen should act as if, by giving an extra dollar to the public good,
all other citizens would be induced to do the same. This could be mirrored for a purely selﬁsh
citizenry by aN− 1 to 1 match for each contribution. In asymmetric cases, however, the appropri-
ate principle is less clear: what precisely does it mean for each citizen to, by her action, make the
maximum universal to all human conduct if all citizens are differently situated?
A natural approach is that each citizen has a “degree of contribution” to a collective good that
is a function of how much she gives h (cj) for some scalar function h. These contributions are at
least quasi-additive across citizens so the total amount of funding is g (∑
ih (ci)) for some scalar
functionh. The Kantian principle would then insist that a citizen j could, by increasingh (cj) by
one percent would see funding increase by 1% of ∑
ih (ci).
In the symmetric case, this reduces to the N− 1 to 1 matching mooted above, but it applies
much more broadly and can be represented by a simple ordinary differential equation. Namely,
for eachj we want
∂g (∑
ih (ci))
∂cj
=
∑
ih (ci)
h (cj) . (10)
It is fairly straight forward to see that this formulation of the categorical imperative as a prin-
ciple for matching mechanisms directly implies LR. To see this, note that
∂g (∑
ih (ci))
∂cj
=g′
(∑
i
h (ci)
)
h′ (cj)
so that (10) becomes
g′
(∑
i
h (ci)
)
h′ (cj) =
∑
ih (ci)
h (cj) .
9
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 10

Structurally, theg′ term must treat all elements in the sum of h’s symmetrically and the h′ term
must only includecj. Thus we must have that
g′
(∑
i
h (ci)
)
=k
∑
i
h (ci) ⇐⇒ g′(x) =kx
for some constantk and
h′ (cj) = 1
kh (cj) ⇐⇒ h′(x) = 1
kh(x).
Integrating these we obtain that g(x) = k
2x2 +m andh(x) = 2√x
k +n. If we want the funding of
a project with no contributions to be 0,m andn should both be 0, narrowing this to g(x) = k
2x2
andh(x) = 2
√x
k . If we want that a good to which a single individual contributes is funded as in
Capitalism, we obtaink = 2 and thus LR.
Thus LR is the logical consequence of creating incentives such that a selﬁsh individual will
behave as if she were guided by the Categorical Imperative.
4.3 Properties of the Liberal Radical mechanism
This discussion leads us naturally to a consideration of the properties of the LR mechanism. First
note that it is homogeneous of degree one, in the sense that if a ﬁxed set of citizens are contributing
and double their contributions, this doubles the funding. This is a useful and reassuring property,
as it implies that, among other things:
• Changing currencies makes no difference to the mechanism.
• Groups can gain nothing by splitting or combining projects with the same group of partici-
pants.
• It matters little precisely how frequently the mechanism is run, whether donations are ag-
gregated at the monthly, daily or yearly level, unless the pattern of donations is temporally
uneven in an important way.
Second, consider what happens in the case where every contributing citizen makes an equal
contribution, say of one unit as we vary the number of citizens contributing Nc. In this case, the
funding received isN 2
c . Thus, holding ﬁxed the amount of the contribution, the funding received
grows as the square of the community size. This is also quite intuitive and reassuring, as we saw
above that under Capitalism, there is a factor Nc underfunding of goods on the margin. It is thus
natural to solve this by multiplying upward funding by the community size.
Third, and following from this point, note that a community that splits in half with roughly
similar contribution proﬁles will receive half the aggregate funding of the total community: both
halves will receive one quarter. This is a clear deterrent against fragmentation and atomization,
and is the core reason why the LR mechanism can solve the public goods problem. However, this
feature does not at all imply that under LR only extremely large communities will form. Different
collections of citizens will have different purposes in using their funds, some in smaller and some
in larger groups.
The trade-off between preference heterogeneity and the beneﬁts of scale is well-known to po-
litical economists, for example, from the literature on the optimal size of nations(Alesina and
Spolaore, 1997). LR does not prejudge this optimal size, but unlike Capitalism or 1p1v offers a
mechanism that creates truly neutral incentives among social organization of different sizes. This
10
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 11

turns out, however, to require providing much greater funding for a given contribution proﬁle to
larger grouping for the obvious collective action reason (see below): each citizen will tend to
contribute less, absent this incentive, to larger groupings where she receives a smaller share of
relevant beneﬁts.
Fourth, note that the mechanism reverts to a standard private good in the case that a single
citizen attempts to use the mechanism for her own enrichment. In the case where the overwhelm-
ing bulk of contributions come from one citizen, other contributions to the sum of square roots
approximately drop out and we are left with the square of the square root, which is simply the
contribution itself. More broadly, as we go towards goods that are approximately private, the
mechanism treats them as approximately private goods.
Fifth, and really just to summarize, the mechanism provides much greater funding to many
small contributions than to a few large ones. This is not for any reason of equity or distributive
justice, though there may be good reasons from those perspectives to admire the outcome it deliv-
ers. It is instead because large communities of citizens each receiving only a small beneﬁt tend to
be disadvantaged by Capitalism relative to concentrated interests, a central concern in democratic
theory since at leastMadison (1787) and famously associated with Mancur Olson’s (1965) Logic of
Collective Action.
While some of these properties may open such a system to potential collusion or manipulation,
as we will return to in §5.2 below, overall we view them as heartening conﬁrmations that our
analysis captures the intuitive core that a solution to the public goods problem should have.
4.4 User interface
Precisely what the LR mechanism would “look like” is beyond our scope here, but a brief descrip-
tion of a possibility will hopefully help readers imagine how it might be feasible. Any citizen could
at any time propose a new organization to be included in the system. Depending on the context,
there might be a more or less extensive process of being approved to be listed in the system by an
administrator; this would be especially important for a philanthropically-sponsored version with
a limited scope, as the philanthropist would not want to fund just any project.
Citizens could contribute their funds towards (or possibly against, see §5.3 below) any listed
project at some regular interval, such as monthly. Citizens would be given some (possibly imper-
fect and delayed, for security purposes) indication of the total funding level of various projects.
This would help citizens determine both the amount of funding projects would receive if they con-
tributed a bit extra (likely aided by appropriate visualizations and “calculators”) to a particular
project and whether a project has enough funding to be successful. This will help avoid projects
overly fragmenting: given the far greater funding that a project supported by many can receive
than fragmented ones, there would be far less incentive than under Capitalism for a thousand
projects to proliferate, and even under present Capitalism some amount of coordination seems to
in practice limit such fragmentation.
As we discuss in §5.2 and 5.6 below, various more detailed features of the system would be
needed to help ensure security and enable coordination among participants. Furthermore, the
precise look and feel of the system requires much more thought and even might affect the formal
rules in some way. None of us are designers so we are far from expert in these questions. We look
forward to seeing what speciﬁc designs those more expert in this area come up with.
11
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 12

4.5 Incorporating the deﬁcit
In the preceding analysis, we assumed that citizens ignore their impact on the deﬁcit for clarity.
We will now see what difference eliminating this assumption makes. Suppose that citizen i has a
shadow value ofλi on reducing the budget deﬁcit; we can think of this as the fraction of the deﬁcit
that will be funded by taxing her or, as we will explore in §5.1 below, the cost to her of reduced
funding of other public goods that a greater deﬁcit will require.
Deﬁnition 9 (Aggregate Cost of Deﬁcit) The aggregate cost of an increased deﬁcit is Λ≡ ∑
iλi.
The aggregate cost of an increased deﬁcit may be greater or less than 1, but we assume it is
roughly on that order of magnitude and that each λi is on the order of 1
N . Under these assump-
tions, in a large society no citizen is ﬁnancing a large share of the deﬁcit.
In this case, citizeni seeks to maximize in her contributions to projectp
Vp
i



∑
j
√
cp
j


2
−cp
i−λi


(∑
i
√
cp
i
)2
−
∑
i
ci

. (11)
The associated ﬁrst-order condition for maximization is
2
[
Vp′
i (Fp)−λi
] (∑
j
√
cp
j
)
2
√
cp
i
= 1−λi↔Vp′
i (Fp)−λi =
√
cp
i
∑
j
√
cp
j
(1−λi). (12)
.
Proposition 10 If citizens have shadow values λi on reducing the budget deﬁcit, and λi is on the order of
1
N , then ΦLR yields underfunding to goodp ofkp wherekp =O(1 + Λ).
Proof. Aggregating the expression in (12) across all citizens yields
Vp′ (Fp)− Λ = 1−
∑
iλi
√
cp
i
∑
i
√
cp
j
↔Vp′ (Fp)− Λ≈ 1↔Vp′ (Fp)≈ 1 + Λ. (13)
The approximation follows from the fact that λi is of order 1
N . In a large population the denomi-
nator in the square root sum ratio is much larger than the numerator. Thus, underfunding to good
p, whenλi is of order 1
N is
kp =O(1 + Λ), (14)
and underfunding is thus bounded by the sum of the shadow valuesλi of reducing the deﬁcit.
This analysis suggests that once we account for the deﬁcit, the LR mechanism does not yield
efﬁciency. Instead it yields underfunding of all public goods by roughly 1 + Λ. How to interpret
this conclusion is somewhat subtle, however, and is something we return to extensively below. For
the most part and in most cases, we believe this does not fundamentally change our conclusions.
We now brieﬂy run through some of these cases:
1. First consider the case, likely common, in which most of the goods funded by the mecha-
nism only beneﬁt a relatively small fraction of the community. In this case, there is little or
no problem, because our analysis relies on negative contributions being made by all of the
citizens that do not beneﬁt (the left-hand side of the ﬁrst-order condition is negative). So
long as these are disallowed (as above), this will drop out most contributions towardsΛ and
we will obtain a conclusion very close to the one based on entirely ignoring the ﬁnancing
considerations. See §5.3 below for more details.
12
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 13

2. In some cases, we may want to allow for negative contributions because certain “goods”
are public “bads” for some, such as ﬁnancing hate speech. Allowing such “shorting” may
be undesirable in some cases, as we discuss in §5.3 below, but assuming we do want to
allow it does not immediately ruin everything. In the natural case when some non-wasteful
tax is used to fund the deﬁcit, Λ = 1 . In this case, LR will just lead to Vp′ = 2 , which
is underfunding of public goods, but not very severe underfunding and in a manner that
is neutral across different goods and thus approximately optimal (see §5.1 below). This
logic also applies to goods that are consumed by a large part of the population: they will
be somewhat underfunded, but not severely. Furthermore, even this modestly pessimistic
conclusion disappears in the case of goods consumed by a small part of the population if we
believe most citizens will not be bothered to make tiny negative contributions to goods they
do not beneﬁt from. Finally, it can be overcome entirely by reducing the cost of contributions
to be proportionally smaller than the amount they inﬂuence outcomes. 4
3. As we will see in §5.1 below, when there is an external philanthropist funding the subsidies
in the mechanism rather than a tax on the community, these issues essentially disappear.
There will be some underfunding, but this is determined by the constraints of the philan-
thropist and not by this ﬁnancing quirk in the mechanism.
In short, while considering incentives to affect deﬁcits creates some complications and poten-
tial deviations from perfect optimality, the impact is small and often irrelevant. Therefore, we
omitted it from our main analysis above.
§5 Variations and Extensions
The above sketch leaves many open questions in many applications. In this section we try to
address some of the most important outstanding questions.
5.1 Budgeted matching funds
In most practical applications the funding for LR is likely to come from philanthropists or some
dedicated government appropriation rather than from unlimited tax revenue. An advantage of
such philanthropic (or dedicated government) funding is that, if most of the participants do not
personally care about the philanthropist’s wealth, it eliminates the issues of ﬁnancing and worries
about deﬁcits in §4.5 above.5 However, most philanthropists do not have inﬁnite funds and thus
cannot simply agree to ﬁnance arbitrarily large deﬁcits. In this subsection we describe a variant
on the LR mechanism that can limit the funding required and some of its beneﬁts.
Consider a rule that is an α mixture of LR with a 1−α weight on Capitalism. We call this the
Capital-constrained Liberal Radical (CLR) mechanism.
4 If everyone is perfectly rational, this occurs in the extreme case in which a minuscule contribution affects funding
by a large amount. We would not advocate this in practice as the risks of manipulation of such a system seem much
worse than the underfunding by a factor of 2.
5One might worry that citizens, rather than taking this mechanism as stated, will think about the fact that is adjusted
to just exhaust the deﬁcit and thus will consider, when giving an extra dollar, the fact that funds are being subtracted
from other projects they value. However, it can easily be shown that such a concern is equivalent, in the aggregate,
to a change in the parameter. If is chosen to just exhaust the budget, therefore, the extent to which citizens do or do
not account for this is largely immaterial: if they do account for it, a higher can be chosen to exhaust the budget as
effectively citizens’ concerns about the budget reduce the perceived value of the good.
13
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 14

Deﬁnition 11 (Capital-constrained Liberal Radical Mechanism) The Capital-constrained Liberal Rad-
ical Mechanism ΦCLR satisﬁes
Fp = ΦCLR(cp
i ) =α
(∑
i
√
cp
i
)2
+ (1−α)
∑
i
cp
i.
The ﬁrst thing to note about ΦCLR is that for any budget B,α may be adjusted to ensure the
budget is not exceeded. To see this, note that when α→ 0 the mechanism is both directly self-
ﬁnancing and, indirectly, the amount invested in the public good falls for the reasons we have
discussed above. Thus, all deﬁcit can be eliminated by setting α low enough. This ensures that
a philanthropist can reliably set a low level of α and perhaps gradually increase it over time to
increase support.
Second, note that no one would ever choose to contribute outside this system (no one’s contri-
butions through it are taxed), so CLR is individually rational.
Proposition 12 The mechanism ΦCLR is individually rational in the sense that ∂ΦCLR
∂cp
i
> ∂Φcap
∂cp
i
.
Proof. To show that CLR is individually rational, compare the marginal impact of individual
i’s a contribution to goodp through ΦCLR to the marginal impact of her contribution top through
a separate mechanism Φcap. We showed in §3 that the marginal value of a contribution underΦcap
is equal to 1. Consider the marginal contribution under ΦCLR:
∂Fp
∂cp
i
=α
∑
j
√
cp
j
√
cp
i
+ 1−α. (15)
The factor multiplying α is by construction always at least 1, so this always exceeds unity, the
marginal impact of a contribution made through a separate, capitalist channel.
The individual rationality property suggests that CLR is consistent with existing within a
broader capitalist society, not just in terms of funding but also in terms of getting people to “play
ball” with the mechanism.
Third, consider equilibrium incentives under CLR. In choosing her contribution to good p,
citizeni maximizes
Vp
i

α

∑
j
√
cp
j


2
+ (1−α)
∑
j
cp
j

−cp
i (16)
Proposition 13 If the population M funding good p is large relative to any individual contribution cp
i ,
then ΦCLR leads to underfunding relative to capitalism. Underfunding for good p is 1
α. When 1
α ≪ M,
ΦCLR yields less underfunding than Φcap.
Proof. The ﬁrst order condition of (16) is
Vp′
i

α
∑
j
√
cp
j
√
cp
i
+ 1−α

 = 1↔Vp′
i ≈
√
cp
i
α ∑
j
√
cp
j
↔Vp′ = 1
α. (17)
The approximation comes from the fact thatcp
i≪M.
The approximation is based on the population funding the good being large relative to any
individual, as will be the case for a genuinely public good; for goods supplied to very small
14
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 15

communities or citizens, funding will be greater than implied by this approximation, but this extra
funding will mostly come through the private channel and not be subsidized by the philanthropist
and thus should not be of great concern to her (it would occur through Capitalism in any case).
Thus, the CLR mechanism will lead to underfunding of the good by a factor of 1
α as compared
to the (rough) underfunding under Capitalism by a factor of the typical size of the beneﬁting
community. Assuming 1
α is small relative toM this can dramatically improve funding relative to
Capitalism.
Furthermore, subject to the budget constraint, this funding is approximately optimally allo-
cated across different public goods in the sense of Ramsey (1927) taxation and the important ex-
tension to allow for heterogenous consumers by Atkinson and Stiglitz (1976). The basic idea of
Atkinson-Stiglitz taxation is that, when considering commodity taxation, it is optimal to distort
the consumption of all goods equally, so that the marginal rate of substitution across all goods is
the same. To see how this works in our setting, we consider the planner’s problem which is the
same as in the baseline set up, but with a new interpretation of the budget constraint. The planner
seeks to maximize ∑
iVi (Fp) subject to the budget constraint which is simply∑
pFp =B. Solving
the constrained maximization problem,
∑
i
Vi (Fp)−λ
(∑
p
Fp−B
)
, (18)
gives us the result that that Vp′ = λ, i.e. Vp′ is a constant. Thus our above result that Vp′ = 1
α
suggests that CLR funding is optimally allocated across goods if α is chosen to just exhaust the
budget.
Of course, this analysis ignores the fact that funding different goods differentially may help
stimulate more private contributions, and the fact that CLR does not quite achieve Vp′ = 1
α as
there are also some contributions through the effective Capitalist channel. Atkinson and Stiglitz’s
analysis is much more careful on these points and gives (fairly speciﬁc) conditions under which
equal distortion ratios are nonetheless optimal. Verifying conditions, considering all this, when
CLR is exactly optimal is an interesting direction for future research, but beyond our scope here.
Some of the underfunding implied by CLR may not be entirely undesirable, as it may balance
under-investment in private goods creation created by the distortionary taxes that will often be
necessary to fund the mechanism (see §5.5 below) and, as we now discuss, deter collusion.
5.2 Collusion and deterrence
The central vulnerabilities of LR, as with other mechanisms designed based on the assumption
of unilateral optimization, are collusion and fraud. Collusion takes place when multiple agents
act in their mutual interest to the detriment of other participants. Fraud takes place when a single
citizen misrepresents herself as many.
Before we turn to potential solutions, it is useful to spell out precisely what these threats are
and the harms they could bring to LR or CLR. Consider, for concreteness, a case of CLR withα =
.1. First suppose one citizen is able to misrepresent herself fraudulently as 20. If she contributes
x dollars in the capacity of each of these citizens, she will pay 20x but her cause (which could just
deposit to her bank account) will receive
.1·
(
20√x
)2 = 40x.
Thus, on net, she doubles her money. This is a sure arbitrage opportunity and could easily convert
LR into a means to just line the pockets of the fraudster. The minimum fraud size required to run
this racket at positive proﬁt is 1
α.
15
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 16

A perfectly colluding group of citizens could achieve something similar. The colluding group
may all be participants in the mechanism, or they may be partially formed of participants in the
mechanism together with one or more outside observers with an interest in the mechanism’s out-
come. Collusion can either happen “horizontally”, between multiple participants with similar
goals, or “vertically”, between one or more participants in the mechanism and an outside partici-
pant (or a participant in a different side of the mechanism, e.g. a potential recipient of a subsidy)
that can offer conditional payments (i.e. bribes) to induce the participants to behave in particular
ways. Again, if the size of this group is greater than 1
α and the group can perfectly coordinate,
there is no limit (other than the budget) to how much it can steal.
However, note that unilateral incentives run quite strongly against this. Consider a colluding
group with 100 members each investing $ 1000, which is thus funded at a level of.1·1002·1000 =$
1,000,000. If this cartel divided the spoils equally among its members, the group members would
each receive $ 10,000 and thus achieve a net beneﬁt of $ 9000. Now consider what happens if
one member decides to defect and contribute nothing. The funding level is now 992· 100 = $
980,100. Thus, the defecting member would see her pay out fall to $ 9801, but would have saved
$ 1000 and thus on net would now be making $ 801 more than she was before. There is thus
very little incentive for any member of the cartel to actually participate. Unless activity can be
carefully monitored and actual payment levels directly punished, defection is likely to be very
attractive and the cartel is likely to die the death of a thousand cuts. Simply sharing revenue with
participants is not close to being sufﬁcient to sustain collusion.
There is a broader point here. If perfect harmonization of interests is possible, Capitalism
leads to optimal outcomes. LR is intended to overcome such lack of harmonization and falls prey
to manipulation when it wrongly assumes harmonization is difﬁcult. This is a bit of a paradox:
while LR seeks to foster community direction through its design, in doing so it relies on strong
ties of community ﬂowing outside the design not existing.
The appropriate way of deterring fraud and collusion will depend on the affordances of the
system. First consider fraud, which is the simpler and more devastating of the issues. If fraud
cannot be reasonably controlled, LR simply cannot get off the ground; it will immediately become
a money pump for the ﬁrst fraudster to come along. Note, however, that this is true of nearly
any system with a democratic ﬂavor: 1p1v can easily be exploited through fraud. The simplest
and most clearly necessary solution to fraud is an effective system of identity veriﬁcation. Beyond
this, relatively small groups giving large contributions and thus receiving large funding should be
audited when possible to determine if fraud has occurred and large penalties (much larger than
the scale of the fraud, to adjust for the chance of detection) should be imposed on the fraudsters
and transferred to other, honest citizens.
Collusion is a subtler and more pernicious problem to root out, and perhaps the greatest chal-
lenge for LR, given the tension between community building and collusion deterrence. In all cases,
a modest value of α and auditing of small, highly funded groups will help deter tight collusive
groups and perhaps mostly take care of that problem. Yet the best approach to deterring broader
collusion will depend on the nature of the setting: a case in which citizens are friendly and all
know each other, as in a small town, will differ from the case in which participants have low trust
for each other and are highly diverse, as in a blockchain community. We begin by considering this
later case and then return to the former.
In a broad-society context, the possibility of collusion can be mitigated technologically. It has
for a long time been understood in the voting systems literature that mitigating vote buying re-
quires a strong privacy property known ascoercion resistance: not only are votes private, but a voter
cannot prove to anyone else who they voted for (or even, ideally, whether or not they voted)even if
they wanted to. It may seem paradoxical that we can improve outcomes in a democracy byreducing
16
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 17

participants’ powers in this way, but such paradoxes arise naturally in tragedy of the commons
scenarios: a participant gains the full beneﬁt from some action (in this case, selling their vote) but
only pays a small fraction of the cost (in this case, the cost imposed to the entire community by
a candidate that everyone privately agrees is suboptimal winning the election because everyone
sold their vote).
The lowest-tech solution, and one perhaps even worth considering, is a literal in-person voting
station. In these stations, anyone can come in with some quantity of cash, and privately distribute
the cash between different bins corresponding to different projects. Individuals would put their
contributions into an envelope before putting it into a bin, so that the size of the contribution could
be inferred upon counting. The anonymized vote can then be calculated, with each voting station
returning only the sum of square roots of contributions, and not the amounts made by any indi-
vidual contributor. There could be one ﬁnal bin in the voting station that does not correspond to
any project, where participants can deposit money that would be simply mailed back to them; this
ensures that even the total amount that a participant spends on contributions would be hidden.
This process would be inefﬁcient, but the coercion resistance property (the inability to prove
what one contributed to or how much one contributed) would be satisﬁed in a way that regular
people could understand and see why it holds. That said, the vision of expanding LR-based tools
to many more spheres of life, and not just highly infrequent elections, requires more efﬁciency
than ofﬂine voting booths can practically accomplish, and so a fully electronic alternative would
be best. It would also be challenging to make such a low-tech solution fully dynamic in the way
that allows for the best possible coordination as we discuss in §5.6 below.
Electronic voting systems that can achieve coercion resistance have been developed (Juels et
al., 2010), and similar work has been extended to the setting of quadratic voting (Park and Rivest,
2017). These schemes typically rely on cryptographic schemes called multi-party computation
and an assumption that you can trust some fraction of citizens. They allow voters to generate
some form of fake keys or fake votes that an attacker cannot tell apart from the real thing, but the
voting mechanism can. However, these schemes inevitably have a vulnerability at setup time: if
an attacker can bribe certain participants to give their keys to the attacker before the process even
starts, the attacker can then use the keys to vote for the attacker’s desired candidate. Even if the
attacker only “wins the race” 50% of the time, this still gives the attacker a large inﬂuence.
Hence, Juels et al. make a trust assumption. In their words:
We make the assumption that the registration phase proceeds without a corruption of voters.
This assumption is at some level a requirement for a coercion-free election, as an attacker capable
of corrupting and seizing the credentials of a voter in this initial phase can mount a simulation
attack. More precisely, we must make at least one of three assumptions about the registration
phase:
1. Erasure of data from voter interaction with R is compulsory by the voter (e.g., enforced
by smartcards provided to voters). This prevents an attacker from requesting registration
transcript data after the fact; or
2. The adversary cannot corrupt any players in R
3. Voters become aware of the identity of any corrupted player in R.
A further kind of attack can take place using trusted hardware such as SGX (Software Guard
Extension). An attacker can bribe voters to generate their keys in an SGX enclave, and use a
signature from the enclave to prove that they have done so. This enclave would run code that
only allows them to make messages that correspond to votes for the attacker’s preferred cause,
17
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 18

and does not allow them to use decoy votes or keys (except with the attacker’s permission). This
property—the ability to prove that one holds a cryptographic key encumbered so that it can be
used for some purposes and not others—is unique to trusted hardware. Further, it presents an
opportunity for attack against all supposed coercion resistant voting schemes.
This possibility can be mitigated by a hypothetical cryptographic primitive that represents a
“proof of not being inside trusted hardware”, for example some computation that due to memory
requirements can be done in traditional hardware but not chips of more limited capacity. Another
approach is that proposed by Juels et al. themselves: an authority issues private keys that are
themselves inside trusted hardware (as they describe it, a smart card), thereby proving that they
are not inside other trusted hardware that has a malevolent use. The smart card may have func-
tionality that outputs the key and immediately replaces the key stored in the card with a decoy
key, allowing any user, immediately upon receipt of the card, to ask for this key and store it in
some secret location. Adversaries looking to buy the user’s votes, even if they do so by buying
the smart card, would not be able to tell that the decoy key now stored in the card is illegitimate,
but the voting mechanism, which uses multiparty computation to ensure that it is not vulnerable
to any single party, would be able to, and would reject the votes and accept the original voter’s
votes.
In general, these techniques can be carried over to the LR setting. The main novel difﬁculty
presented by the LR setting is in revealing the total amount that a user spends on contributions so
that their balance can be subtracted, and allowing the user to perform an operation that consists of
“sending money to themselves” inside the mechanism. If this issue is not sufﬁciently dealt with,
users could pretend they contributed a larger amount than they contributed.6
The multiparty computation could, in addition to calculating the square of the sum of square
roots of contributions, also calculate the sum of the contributions, plus a “decoy amount”, from
that participant. It would also ask each participant for a “decoy refund address.” The computation
would hold a private key to a fully privacy-preserving payment system, such as Zcash, and it
would generate transactions that refund the participant their decoy amount and publish them.
The computation would also publish the total contributions plus decoy for each participant, so
that these amounts can be subtracted from the participant’s account.
Other potential schemes for large-scale, relatively low-trust environments are more specula-
tive, but could hold some beneﬁts based on exploiting and undermining trust required to operate
a collusive scheme. For example, enforcers (either human or bots) operating on behalf of the
system might impersonate voters seeking to receive bribes; those offering bribes could them be
penalized (though their cause should not be, as this would open the scheme to attacks by those
seeking to defund a good). If coercion resistance could be achieved, such decoys could be use-
ful even without punishment as the simple act of offering to accept a bribe and then betraying
the briber’s trust would undermine collusion. Decoys could also impersonate bribers and penal-
ize those accepting the bribes or fail to follow through on the bribe paying. Amnesties or even
rewards could be offered for those who offer evidence proving collusion is going on and could
be ﬁnanced by ﬁnes on those engaging in the collusion. Many schemes like this are presently
used to reasonable effect in law enforcement and can be scaled up and improved by thoughtful
mechanism design, an interesting direction for future research.
In smaller groups where mutual knowledge and trust are much higher, many of these ap-
proaches will be less effective. LR may in any case by less useful and less widely used in those
6 Users can receive a small, e.g. 0.001%, “interest rate” on their “decoy” contributions, encouraging everyone to
over-contribute, thereby providing cover for participants that want to hide the fact that their total contributions are
large; such participants could claim they sent large decoy amounts and did so for the interest payments.
18
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 19

contexts, as social norms may be enough to ensure reasonable public good provision. But where
this is not the case, it would be important to develop a cultural commitment that collusion by sub-
groups constitutes cheating, just as stealing common resources would constitute cheating. More
generally, in cases between small and large societies, some combination of norms/community en-
forcement with the formal schemes we describe above may sufﬁce to address the problems posed
by collusion. But, being the largest threat to LR’s effective operation, only experimentation will
tell both how serious these problems are and how they can most effectively be overcome.
5.3 Negative contributions
Not all public projects bring beneﬁts alone; some may harm certain citizens by creating negative
externalities such as pollution or offense such as hate speech. This does not immediately imply
we should allow negative contributions to reﬂect these harms: some of these negative externali-
ties can be addressed directly through legislation, there are some dangers of allowing citizens to
defund projects they don’t like and allowing negative contributions opens some tricky issues as
we discussed in §4.5 above. However, in some cases the beneﬁts of allowing the expression of
negative externalities will outweigh these concerns and thus negative contributions will be desir-
able.
The natural extension of LR to allow negative contributions is that citizens may choose to
defund a public good according to the same cost structure.
Deﬁnition 14 (± Liberal Radical Mechanism) The± Liberal Radical Mechanism, Φ±LR(cp
i ) satisﬁes
Fp = Φ±LR
(∑
i
±i
√
cp
i
)2
,
where±i is positive or negative at the discretion of citizeni.
Citizens with Vp′
i ≥ 0 orλi in the cases where they account for their budget impact will choose
the positive sign; those with the opposite will choose the negative sign.
We already know the ﬁrst-order condition for positive contributors; let’s consider it for nega-
tive contributors (for simplicity we focus on the deﬁcit-ignoring, fully ﬁnanced case):
−
Vp′
i (Fp)
(∑
j±j
√
cp
j
)
√
cp
i
= 1↔Vp′
i (Fp) =−
√
cp
i
∑
j±j
√
cp
j
. (19)
Note that together with the ﬁrst-order condition for those making positive contributions, (9)
and (19) can be summarized as
Vp′
i (Fp) = ±i
√
cp
i
∑
j±j
√
cp
j
. (20)
Aggregating across citizens yieldsVp′ (Fp) = 1, as is optimal. Allowing negative contributions
is thus desirable in the following sense: without allowing them, there may be negative externalities
of a project that are not internalized into its funding.
However, as noted in §4.5 above, it is principally allowing negative contributions that leads to
underfunding if citizens consider their impact on the deﬁcit, though as noted in the previous sub-
section, some underfunding of this sort may actually be useful to deter collusion. More broadly,
negative contributions may be a quite powerful way to deter collusive schemes as they offer a way
19
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 20

for any citizen to be a “vigilante enforcer” against fraud and abuse. The downside of this beneﬁt,
however, is obviously that, in some cases, absolute free speech and other protections may lead us
to distrust such vigilantism.
In short, there are a variety of costs and beneﬁts to allowing negative contributions and we
suspect their desirability will vary across contexts.
5.4 Variations on functional form
One might naturally wonder if the functional form we propose is uniquely optimal. We believe
that it is, up to some quirks. 7 We leave a formal proof for future work, but instead here illustrate
the point by considering a class of rules that nests both LR and Capitalism, illustrating a spectrum
of potential solutions.
Consider rules Φβ that satisfy
Fp = Φβ(cp
i ) =
(∑
i
(cp
i )
1
β
)β
. (21)
Again, we analyzeΦβ abstracting from deﬁcits and incentives created by mechanisms that take
this form. To avoid redundancy, we skip straight to citizeni’s ﬁrst-order condition:
Vp′
i
(∑
j
(
cp
j
)1
β
)β−1
(cp
i )
β−1
β
= 1↔Vp′
i = (cp
i )
β−1
β
(∑
j
(
cp
j
)1
β
)β−1↔Vp′ =
∑
j
(
cp
j
)β−1
β
(∑
j
(
cp
j
)1
β
)β−1. (22)
A convenient property of this form is that for β >1, unlike for the exactly β = 1 case, every
citizen with strictly positive Vp′
i will make a positive contribution. Note that as β→ 1 however,
this rule approaches Capitalism, while whenβ→ 2 this becomes LR.
Away from these now-familiar cases, it is useful to consider what happens for β∈ (1, 2) and
β∈ (2,∞). Note that our reasoning above implies that Vp′ is in all these cases equated to some-
thing of the form ∑
ih (xi)
h (∑
ixi), (23)
wherexi≡
(
cp
j
)1
β
andh (x)≡ xβ−1. Whether this ratio is greater than or less than one is deter-
mined by Jensen’s inequality.8 That is, public goods will be over (under) funded if the function
xβ−1 is convex (concave). Given that β = 2 leads to efﬁciency and β = 1 leads to the severe
underfunding of Capitalism, this should not be too surprising.
This might lead one to wonder, might notβ∈ (1, 2) be a superior interpolation between Capi-
talism and LR compared to our CLR mechanism in §5.1 above? While, as we discuss shortly, this
may be a reasonable idea to experiment with, theory indicates it is an inferior solution. To see
why, note thatβ∈ (1, 2) does not simply lead to underfunding, but to differential underfunding of
7 As Eguia and Xefteris (2018) show, in a sufﬁciently large population (holding ﬁxed value distributions, any function
with a zero ﬁrst derivative and positive second derivative will behave like QV; this idea should extend to our present
context. We think this is not very meaningful, however, as the appropriate limit is often one where value distributions
also change as the population grows, so that behavior of the function away from zero also matters.
8Jensen’s inequality states that the sum of a function applied to numbers is greater (less) than the function applied
to the sum if the function is convex (concave).
20
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 21

projects with many small contributors. To see this note that we can rewrite citizen i’s ﬁrst-order
condition as
(
Vp′
i
) 1
β−1
= (cp
i )
1
β
∑
j
(
cp
j
)1
β
↔
∑
j
(
Vp′
j
) 1
β−1
= 1. (24)
Thus the efﬁciency condition that the aggregate marginal utility equals one obtainsexcept that the
transformation x
1
β−1 is applied to it. For β < 2 this transformation is convex, which will thus
exaggerate large marginal utilities and dampen small ones. Thus, β < 2 systematically leads to
the underfunding of goods with many small beneﬁciaries and over-funding of goods with a few
large beneﬁciaries.
This result may be problematic for two reasons. First, it is problematic from an efﬁciency
standpoint. It is far worse than the budget-constrained efﬁciency we (approximately) obtained in
§5.1 above from CLR. In addition, it would seem to make small group collusion quite proﬁtable.
This is not to say that using a function other than quadratic has no purpose, nor that CLR
will not lead to relative over-funding of projects with a few intense supporters. It may in some
cases be useful to replace the square root and square functions with ones that behave more like
the absolute value near the origin and only become quadratic further out to avoid large groups
engaging in trivial collusions with very small amounts of money each. And CLR does relatively
overfund goods with intense supporters, though only in the sense that it has a (quite unimportant)
element of Capitalism built into it. But generally, we view these other functional forms primarily
as a foil that helps us understand LR and the failures of Capitalism, rather than things we would
advocate the use of.
5.5 The Henry George Theorem
Thus far we have been casual about how we would imagine LR being funded: we have imagined
money “falling from the sky” via well-intentioned philanthropists or being collected from citizens
at no cost. In this subsection we take this problem more seriously, though a full solution is beyond
the scope of this paper and is a leading direction for future research.
Before diving in, a bit of background is in order. Our problem of how to ﬁnance public goods
is a classic one and our solution follows in the path of a tradition of solutions pioneered by George
(1879) and his most important contemporary academic follower, William Vickrey (1977). 9 While
very general and quite abstract, this “Henry George Theorem” has a simple intuition familiar to
most people in a basic case.10
Consider a town that improves its schools. Typically, real estate values in that town will rise.
If people are sufﬁciently mobile, all need houses of the same size and tend to value the schools
equally, so the real estate value must rise precisely by the amount that people value the schools.
Now suppose this school improvement is costly. It is only worth making if its value is greater
than the cost. Thus, if the improvement is worth making, real estate values should rise in the
aggregate by more than the cost of improving schools. Thus, if this increase in real estate value
could be captured as a tax, this tax would more than ﬁnance any improvement to schools that is
worth making. A 100 % tax on land values thus sufﬁces to fund any improvement worth making
to schools, and the same intuition applies to any local public improvement.
9 As Arnott (1998) points out, Vickrey was the ﬁrst to discover the formal HGT, but was last to publish it of the early
crop and thus lost credit for the discovery.
10Some of the most canonical and one of the more general statements of the HGT are by Stiglitz (1977) and Arnott
and Stiglitz (1979).
21
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 22

While this basic logic was the primary way Henry George himself imagined these ideas and
is the easiest to imagine, Vickrey pointed out that the logic was both much broader and, in some
sense, narrower than this. Broader because the logic applies not only to schools or other public fa-
cilities, but to anything that makes the city a more desirable place to live, including neighborhood
amenities provided by artists or restaurants, businesses or public transit that may require subsi-
dies if priced efﬁciently below cost, the availability of ride hailing services (again which should
efﬁciently be priced below cost; see Arnott, 1996) and so forth. Broader too because the principle
applies in settings where land is irrelevant. For example, within a cryptocurrency community we
should expect that the value created by open source projects that make the community function
better will end up accruing (at least in large part) to those that own the currency or for-proﬁt busi-
nesses running on it. It is narrower, however, because precisely for this reason, it is clearly not
only “land” that would need to be taxed, but other “sinks” of value.
Such value sinks may in principle be quite different than land. For example, imagine a world
with inﬁnite equally good land. But suppose that every family has its own language and cannot
learn the languages of other families; thus, little trade and cooperation is possible. Now imagine
there are ﬁve people in the entire world who have the capacity to translate among people and
enable cooperation, but they can only do this in some localized area and only for a certain number
of people, allowing explosive development of civilization only near their physical vicinity. Natu-
rally cities will form around these individuals and they will be able to charge nearly the full value
of civilization for their services, as they can always threaten to go and start another civilization
elsewhere. In this case, the decreasing return resource to which the value accrues will be these
special individuals rather than land.
At its broadest level of generality, the question is how the subsidies required by increasing
returns to scale activities should be funded. An activity has increasing returns to scale if it can
more cheaply be provided to many people than the sum of the costs of providing it separately
to each of these people. Such activities have a marginal cost that is below their average cost
and thus should charge a price that, if collected, will not cover the costs of creating it in the ﬁrst
place. It will therefore require subsidies. Pure public goods are a special case, but public transit,
vaccines, software and others all have this property that, if they only charged for the marginal cost
of additional uses they would have little chance of covering the cost of creating them in the ﬁrst
place.
The Henry George Theorem (HGT) gives a general answer to this question. It states that,
so long as the value created by these goods exceeds their cost, which it must if they are worth
creating, the ﬁnancing necessary to support them must accrue as rents or proﬁts captured by
some declining-returns-to-scale activity such as land, some form of ﬁxed capital or a monopoly
rent accruing to some agent in the economy. Therefore, it is always possible to fund optimal
provision of public goods based on taxing away the rents of declining returns.
The question this obviously raises is how the increasing-returns activities that are worth under-
taking can be identiﬁed and how the rents associated with the decreasing returns to scale activities
can be identiﬁed and taxed without damaging the economy. LR provides a fairly comprehensive
answer to the ﬁrst question, but does not answer the second one. Nonetheless, examples of de-
creasing returns goods are not too difﬁcult to enumerate and there are existing taxes explicitly set
up to tax them. Congestion pricing on heavily trafﬁcked roads, air trafﬁc rights, taxes on land
and corporate proﬁts and spectrum policy are all examples of policies designed to tax decreasing
returns activities.
Moreover, a modern manifestation of George and Vickrey’s ideas suggests a speciﬁc way of
identifying decreasing returns activities and their associated rents. Harberger (1965) and more
recently Weyl and Zhang (2018) propose a self-assessed tax on capital with a right of compul-
22
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 23

sory purchase for any buyer willing to pay the possessor’s self-assessed price. Because this tax
overcomes the monopoly problem of sellers holding out for higher payments for their assets, it
can alleviate much of the misallocation of assets, increasing aggregate wealth, at the same time
as it taxes away rents associated with ﬁxed assets. In this sense, it perfectly ﬁts the bill on the
tax side of the HGT. At the same time, it would play an intriguing role in a society governed by
LR, as the communities funded by LR would likely be the primary payers of the relevant taxes
and thus it would not just serve a funding role, but also a role of allocating assets across commu-
nities, allowing them to compete for scarce resources. In this sense, LR paired with Harberger’s
tax offers an intriguing vision of a new society with efﬁcient public goods provision funded by
efﬁciency-enhancing taxes.
All that said, a couple of caveats are worth bearing in mind. First, the Harberger tax, while
increasing aggregate value overall, is a tax on investment at least when applied to assets that
require some investment to maintain, create or improve. Posner and Weyl (2018) argue that at
optimal rates on most private capital, the private return on productive investments would be
roughly 1
3 of its optimal level. This leads to underfunding of private goods in much the same
manner as public goods are underfunded when α = 1
3 in §5.1 above. This points towards an
interesting equilibrium, a society in which all investments, private or public, are underfunded by
the same ratio (perhaps 3) and thus there is no bias across different scales of projects. This would
be a satisfying resolution to Galbraith (1958) claim that many societies face “public poverty” amid
“private afﬂuence”.
A more serious concern is that some rents end up accruing not to ﬁxed physical capital but
to human capital or in the relationships among citizens who are nonetheless a small part of the
broader society. Our example above of the ﬁve translators is a clear case, as would be any public
good that increased global happiness for all equally in a world with a constant population: these
beneﬁts would not affect prices and would exclusively accrue directly to such citizens.
To the extent this is the case, such rents cannot be captured by any known efﬁcient tax; dis-
tortive income taxes are the only widely accepted method. This may lead to greater under-funding
of public goods and even private capital investment, and relative over-investment in personal ca-
pacities on which rents can freely be earned. Addressing this problem is far beyond the scope of
this paper, but we suspect it would become a leading social concern in an LR society.
5.6 Failures of concavity and dynamic solutions
Above we assumed that all functions Vp
i were smooth and concave. When they are not this does
not create a signiﬁcant problem for our analysis, but it does mean that it may be ideal to structure
the format of the mechanism to avoid this causing any problems.
To make things concrete, consider the case in which the value derived from a public good is S-
shaped (sinusoidal) and thus unless the good is funded “sufﬁciently” very little value derives from
it, whereas once it is funded sufﬁciently the marginal value of funding quickly diminishes. This is
a natural structure for projects with a nearly-ﬁxed budget, like a work of public infrastructure. In
this case, citizens will not be willing to contribute unless they expect others to do so as well.
A natural solution to this problem is what is often called an “assurance contract” and was pro-
posed by Dybvig and Spatt (1983). The most natural implementation is dynamic, and we suspect
this is how an LR mechanism would operate in practice in any case, but static implementations are
also possible.11 Essentially, a window is open for contributions and withdrawals of contributions
11 For example, citizens could state a schedule of how much they would like to contribute, conditional on the con-
tributions of others, or some coarse approximation thereof, such as a minimum threshold for their contribution. An
automated system could then calculate an equilibrium of these requests.
23
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 24

to the mechanism to change during a period. Citizens are thus able to contribute without fear that
they will be left “exposed” to the risk that others will not contribute. Given this, every citizen may
as well make a reasonable contribution until the relevant threshold has been reached. In the spirit
of Tabarrok (1998), an entrepreneur conﬁdent that a good is worth funding can further sweeten
the deal by offering citizens a payment if they agree to temporarily fund the mechanism to avoid
any potential even weak coordination problem.12
This dynamic implementation is very likely to be desirable even if Vp
i is concave, as the opti-
mal contribution will still depend on others’ contributions. Thus, it makes little practical differ-
ence whether the value functions are concave, except possibly for the chance of a weak cold start
problem, which a Tabarrok-style scheme could address. Similar points apply to cases in which
smoothness fails, but given the uncertainty that is in any case likely to prevail in most cases we do
not think such cases are likely to be generic.
§6 Applications
We discuss several applications of LR in order to illustrate the importance of its many nice features
in practice. We choose these examples not necessarily because they are the most important or
pressing, but because they nicely illustrate the range of cases, across quite distinct domains, where
we believe LR can be useful in the relatively near term.
6.1 Campaign ﬁnance
In the US, the regulation of individual and collective contributions to political campaigns has
been hotly debated since the ﬁrst attempts to regulate campaign ﬁnance in the mid-1800s. The
1971 Federal Election Campaigns Act and subsequent amendments introduced extensive rules
and procedures for campaign funding geared toward balancing transparency and equity with
freedom of expression, and established the Federal Elections Commission (FEC) to regulate the
fundraising activities of candidates for public ofﬁce. Campaign ﬁnance issues frequently make
their way to the Supreme Court—and the court’s Citizens United decision has maintained a steady
stream of vigorous opposition since its ruling in 2010.
The proposals for campaign ﬁnance reform are manifold. Suggesting modiﬁcations to munic-
ipal, state, and federal election law, these proposals range from simple tweaks of existing laws
(e.g. capping contributions, stricter enforcement, restricting contributions from unions and cor-
porations, etc.) to extensive re-envisioning of electoral systems (e.g. public ﬁnancing schemes,
anonymous capped contributions, etc.). 13 The proposals for reform offer solutions to the core le-
gal and political question: How can regulatory bodies strike a balance between freedom of expres-
sion through contributions to campaigns for elected ofﬁce, while restricting the undue inﬂuence
of special interests?
The motivating problem for campaign ﬁnance reform can be analyzed using the formal appa-
ratus presented in previous sections. When un-checked, permissive campaign ﬁnance laws such
12 Note, however, that Tabarrok’s suggestion that such a scheme alone, without moving away from Capitalism,
is enough to fund public goods, is basically “wrong”: it is based on a non-generic assumption of precisely inﬁnite
derivative in the utility functions at a single point. Any sinusoidal structure that is smooth will destroy this and lead
to arbitrary underfunding, whatever the “assurance” structure. This is also true with the literally discontinuous payoff
function for generic informational structures on values (Mailath and Postlewaite, 1990).
13For inﬂuential discussions of campaign ﬁnance reform, see Ackerman and Ayres (2002), Lessig (2011) and Hasen
(2016).
24
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 25

as the ones upheld in Citizens United are simple capitalistic contributory schemes. As demon-
strated above, the Capitalism mechanism for ﬂexible funding of public goods leads to tyranny
of the few who have resources to make very large contributions. In the campaign ﬁnance set-
ting, the failure of a capitalistic mechanism implies that on the margin, only a single contributor
(the largest contributor) has any inﬂuence on the margin. The motivating problem of campaign
ﬁnance is Capitalism’s vulnerability to tyranny of the rich, especially when one considers the pos-
sibility for quid pro quo corruption. Just as the LR mechanism answers to this central problem of
capitalistic funding, it provides a template for a new proposal for campaign ﬁnance reform.
The LR mechanism solves the key problem of funding under Capitalism by boosting the con-
tributions of small donors, thereby effectively diluting the inﬂuence of larger ones. Under other
Capitalism-based schemes, individuals able to make only small contributions have no incentive
to contribute, knowing that their contributions are just a drop in the bucket. Under LR-based
campaign ﬁnance, all individuals have incentive to contribute so long as their evaluation of the
candidate is positive. This fact also has good second-order outcomes that are the converse of
the quid pro quo corruption under Capitalism—since all individuals have incentive to contribute,
campaigning politicians thus have to give some weight to every individual in their electorate. Un-
der LR-based campaign ﬁnance, fundraising and outreach are intertwined, leading politicians to
engage more thoroughly and deeply with their electorate.
The rationale for moving toward LR in campaign ﬁnance in part parallels the rationale be-
hind existing political matching funds. Public matching funds for campaigns—such as the federal
matching fund for presidential elections 14 and municipal and state matching funds for legisla-
tures and mayoral races 15—aim to amplify small contributions to campaigns for elected ofﬁce.
Thus, like the LR mechanism, matching funds subsidize small contributions. Yet matching funds
systems are highly arbitrary: often they match contributions up to some level with some multi-
ple, and then nothing beyond this level. How is this level and the amount of the match chosen?
Shouldn’t there be a more gradual taper of matching commitments? LR gives precisely an optimal
mechanism for achieving this.
Furthermore, while the usual rationale behind matching systems, at least as described to the
public, is some pretense of equity, the rationale for an LR-based system does not even rely on an
argument from equity. Indeed, LR is an (approximately) optimal mechanism from an efﬁciency
perspective as we showed in §5.1 above. LR for campaign ﬁnance is thus joined to matching
funds proposals in spirit, while offering substantial improvements over these existing proposals
in practice.
The efﬁciency rationale for LR and the fact that it does not tax speech has another important
practical beneﬁt: it would likely pass constitutional muster even under the post-Citizens United
state of American constitutional law. Large contributions are not taxed as we showed in §5.1.
Thus, the system simply boosts the relative importance of small donors.
Precisely how to apply LR in the context of campaigns would still have some signiﬁcant sub-
tlety. Should there continue to be contribution limits until enough funds can be raised to make α
reasonably high? What should a campaign have to do to be allowed to list in the system? How
much should different candidates be allowed to form “parties” than then disperse funds to their
candidates? Should contributions be public or doubly blind (as in Chile) so that candidates and
parties do not know their own contributors to avoid corruption and collusion? But overall, we
14The federal matching fund for presidential campaigns is ﬁnanced by a $3 voluntary contribution on income tax
returns.
15As mentioned in the introduction, New York City’s matching fund policy has led other cities and states to consider
similar procedures. However, several states had publicly ﬁnanced matching funds deemed unconstitutional by the
2011 Supreme Court Cases, Arizona Free Enterprise Fund v. Bennett and McComish v. Bennett.
25
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 26

believe the structure of LR/CLR would dramatically simplify the byzantine patchwork of current
campaign ﬁnance regulations.
6.2 Open source software communities
The open source software movement is based on the principle that code is or should be a public
good. Software is a classic example of an increasing returns activity, as it is nearly costless to copy
and apply broadly, yet has potentially large upfront development costs, especially when the uncer-
tainty of any solution working out is factored in. Many in the software community view exclusion-
ary capitalist solutions as wildly inefﬁcient and undesirable, yet democratic or government-driven
provision is usually far too hierarchical and centralized for fast moving technology appreciated
primarily at ﬁrst by a small community of geeks. This has led to a powerful movement of open
source developers; see Benkler (2007) for a classic exposition of this view.
Yet, as Lanier (2013) argues, in many ways the open source movement has been a failure.
It almost always relies on some level of proprietary corporate backing or directed, hierarchical
government support, and even then almost all contributors tend to be geeky men from privileged
backgrounds, as others cannot afford to give their time away in this manner. Many if not most of
the beneﬁts of such systems have increasingly been captured by “central nodes” or what Lanier
calls “siren servers” such as Google and Facebook, and the systems do not seem to serve the broad
public well.
Open source communities are increasingly trying to address these limitations and provide
funding for public goods provision through open source development through a variety of meth-
ods. Two particularly popular recent examples are cryptocurrencies and crowdfunding.
The crowdfunding solution is that developers can post projects and solicit voluntary contri-
butions, sometimes in exchange for a token related to the project or other small consideration.
While such approaches have had some success, they ultimately push the problem of charitable
funding in Capitalism back just one layer, onto those who are supposed to contribute without any
prospect of a commensurate return on the marginal contributions they make. Thus, instead of
the open source developers directly donating their time, here crowd funders may also jump in.
Ultimately, though, the problems are very similar.
Blockchain-based development communities, such as Ethereum and Zcash, have taken a quite
different approach. They are based around currencies intended to represent the value of the
ecosystem and a signiﬁcant part of this currency is reserved by foundations associated to each
community that intend to make grants to support public goods within the community. Further-
more, several community members who have grown personally wealthy through the bubbles
created by speculation on the success of these technologies have a philanthropic, and possibly
also speculative, interest in seeing the communities thrive and are thus willing to contribute to
this out of their personal holdings. At present, this primarily occurs through a reasonably cen-
tralized process of grant-making by leaders who hold formal and informal authority within these
foundations. However, such a hierarchical structure seems both poorly attuned to the needs of
the communities and, perhaps more importantly, antithetical to the principles of decentralized
authority on which they were founded.
The LR mechanism seems a good ﬁt to address both sets of problems and for the culture of
the relevant communities. For crowd-funding, it is easy to imagine a philanthropist, such as one
of the leaders of the technology industry who has grown rich off the value created on the inter-
net, sponsoring a crowd-funding website that uses CLR to support crowd-funded open source
projects. Many such leaders want to “give back” but don’t always feel qualiﬁed or do not have
the bandwidth to go around giving out grants. CLR in a crowd-funding setting seems a natural
26
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 27

remedy.
The ﬁt is even clearer within blockchain communities. These communities are awash in funds
given the hundreds of billions of dollars resting in cryptocurrency market capitalizations, a large
percentage of which is held by foundations or wealthy individuals strongly committed to the
principle of decentralizing power and interested in contributing towards stimulating public goods
provision within the communities. We suspect that such environments will be the ﬁrst domain of
practical application of the LR mechanism.
Yet even more exciting is the prospect of new blockchain communities, whether currencies,
token-based communities or other internal projects, that are built upon LR principles, coupled
with relevant tax supports. Such communities could act as an exciting testing ground for the
LR mechanism and could organically grow if the logic of the HGT works to set off explosive
growth by funding relevant public goods whose value is then recycled by taxation into further
such activities.
The largest practical impediment to achieving this is the anonymity and pseudonimity that is
so pervasive within such communities. Clearly, LR relies heavily on separate human identities and
can easily be exploited if identities can be replicated. Whether these difﬁculties can be overcome
is an interesting question that experimentation and technological advances for identity solutions
will reveal.
6.3 News media ﬁnance
The production of news is perhaps the perfect application for the LR mechanism. On the one hand,
(especially high-quality, investigative) news is perhaps the clearest example of a public good. It
can be costly to create, but it is essentially impossible to exclude anyone from consuming it beyond
a very tiny window of time and thus it is very difﬁcult to earn value without highly costly and
wasteful mechanisms of exclusion. This problem has become increasingly acute with the rise
of information and communications technology, leading to an increasing sense of crisis in the
funding of news, which some have even labeled as “existential” (Foer, 2017).
Yet news is also often relevant to a very broad community, making purely charitable fund-
ing difﬁcult to pull off. This creates a strong desire for public funding and is the reason that
governments all over the world are involved in news production. However, the drawbacks of
government involvement in news creation could hardly be more evident, given the central role of
media in holding governments to account.
LR offers a potentially appealing resolution. Governments and philanthropists interested in
supporting high-quality news without exerting or being seen to exert undue inﬂuence over con-
tent could use CLR to effectively match donations to news creators in much the way that they
already match contributions to organizations like National Public Radio in the United States. Us-
ing CLR rather than standard matching would create much greater efﬁciency and require far less
targeted and discretionary applications of funds, instead allowing a truly diverse ecosystem of
potentially new and innovative news outlets to ﬂourish.
Given the ways in which the technology of news creation and distribution is changing, an ex-
clusive focus on long-established outlets that currently receive matching funds seems misplaced,
yet governments and philanthropists are struggling to distinguish which new initiatives are wor-
thy of support without tipping the scales towards outlets that support their interests. CLR seems
a perfect match for this problem and, given the prevalence of contributions towards public broad-
casting, would be largely familiar to many potential contributors. In this area it is not even hard
to imagine democratic governments voting to raise additional tax revenues to support such an
initiative, especially at local levels of government where investigative journalism by local news
27
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 28

sources has been particularly hard hit.
Yet while news is a leading example where governments and philanthropists want to and do
use matching funds to support a more “market-driven” approach to giving away money, it is far
from the only such domain. Tax deductibility of charitable contributions is essentially a match,
and many corporations further match charitable contributions by their employees.
Many philanthropists provide matches to favorite charities and many are seeking more cre-
ative ways to harness decentralized information outside the philanthropist’s whims to give away
money; witness the “open philanthropy” and “effective altruism” movements. Across a wide
range of domains, from funding educational start-ups to large scale interventions in developing
countries, CLR holds potential to provide more accurate and less hierarchical signals for direct-
ing charitable funds. This seems increasingly relevant as backlash continues to grow against the
top-down dictates of well-intentioned but ultimately elitist class of donors (Easterly, 2007; Giri-
haradas, 2018; Reich, 2018).
6.4 Municipal projects and public works
While urbanists have long recognized the importance of community-level decision-making in
cities, cities often lack mechanisms that allow goods valued in communities to emerge. LR, as
applied to urban public funding decisions, could allow communities at all scales to fund projects
that would struggle to get funding under centralized systems. A growing body of evidence sug-
gests that policies emphasizing community values and diversity generate major improvements in
city life. The city is thus lush with opportunities for economic prosperity, if small communities are
able to ﬂourish.
But city councils and other municipal governments struggle to meet the needs of subcommu-
nities. Even though they are democratic systems intended to represent the will of a constituency,
the needs of very small groups cannot be heard for reasons we have discussed. Some public
goods are intensely important to a select few, for example a small group of households clustered
in a few city blocks. And yet, the systems in place for communicating those needs and receiving
the adequate funding are highly inefﬁcient. First, a councilmember representing those few city
blocks must understand the importance of the public good to this fraction of her constituency in
order to propose its funding to the council. Then, funding for that good is put to a council vote.
That localized public good will fail to get funding when put to a city-wide vote, because the city
councilmember representing that block will only get one vote when the council goes to vote.
It is clear that 1p1v does badly for funding municipal projects valued by a select few, and cap-
italist contributory schemes do little better. Artistic and cultural community centers—no doubt
public goods that allow cities to thrive—rely heavily on private donors. Some artistic and cultural
centers have no trouble getting funded through capitalist contributory schemes in cities, due to the
recognition and signaling that comes with a donation to a famous public space, such as the ﬂag-
ship branch of the New York Public Library in Bryant Park (renamed the Stephen A. Schwarzman
library in 2008). Few will make contributions, but it’s unlikely that the famed branch will soon
struggle to keep the lights on. In contrast, the smaller local Macomb’s Bridge branch on 152 nd
street in Harlem, survived as a 685-square-foot studio apartment with a maximum occupancy of
25 from its founding in 1955 until ﬁnally getting a long overdue upgrade in 2017.16
The merits of LR as applied to city planning align nicely with the ideas advanced by some of
the most prominent modern urban theorists. Activist and intellectual Jane Jacobs (1961) famously
condemned the urban planning ethos of her time, exempliﬁed by Robert Moses’s aggressive urban
16Find a press release detailing the history of the Macomb’s Bridge Branch here.
28
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 29

renewal policies. She argued that rationalist urban planners do a poor job serving the needs of
actual city-dwellers, undoing the sense of community that makes people move to cities in the ﬁrst
place through their top-down, deductive approach to allocation and decision-making. She argued
for the need for diversity and community in cities by tracing the economic beneﬁts from their
sources to their higher order consequences.
Similarly, anthropologist and geographer David Harvey has long recognized the importance
of the city as a locus of self-deﬁnition through community attachment. He articulates the often
ignored “right to the city" which is “far more than the individual liberty to access urban resources,"
and is “a common rather than an individual right since this transformation inevitably depends
upon the exercise of a collective power to reshape the processes of urbanization" (Harvey, 2009).
Harvey emphasizes that precisely because the urbanization process creates so much surplus, the
“right to city" demands new forms of democratic management of that surplus.
And yet it is difﬁcult or impossible for city-level ofﬁcials to act as the sole channel for demo-
cratic management of the city. Urban dwellers have heterogenous access to power and local ofﬁ-
cials and are fragmented and diverse in their interests. Economic development, Harvey and Jacob
might agree, requires community-level decision-making in urban planning because a centralized
rationalist perspective will never confer on cities the kind of diversity that makes them hum.
The city is a fertile site for application of LR, and these applications are among the most promis-
ing in terms of feasibility of self-funding. If LR were applied to funding allocations for municipal
projects and public works in cities, the system would have a good chance of funding itself by the
logic of the HGT discussed in §5.5. Vickrey (1977) himself observed that the logic of the HGT
applies to any public good that makes a city more appealing, community level or broader. By the
logic long-held by political economists and urban theorists alike, the sorts of goods that would get
funded under LR are the very goods that would create increasing returns.
§7 Discussion
In addition to its practical applications, the framework developed in the preceding sections may
point toward a lucid illustration and a potential resolution of key tensions in liberal political
thought. We offer here a few remarks on how the LR mechanism, as we have presented it in
previous sections, may offer a blueprint for a new variant of liberalism, which we call Liberal
Radicalism. We show here that the failures of the two suboptimal mechanisms considered in
§3 can be understood as substantiations of two dominant critiques of the theory and practice of
liberalism. Fundamentally, these critiques are two ways in which liberalism—as instantiated in
historical and present contexts—has failed to live up to the ideals to which it aspires.
Liberalism is a word we use often in this paper and it carries many meanings to many peo-
ple. Our intention is to refer to a broad political theory, closely associated with the tradition of
the Enlightenment. That tradition opposes arbitrary or historically-derived centralized authority.
It favors—to the maximum extent consistent with social order—social systems that are neutral
across reasonable competing conceptions of the good life held by individual citizens.
We can thus formulate the commitments of liberalism—as we conceive of it here—in terms of
two fundamental desiderata:
D1. Facilitation of individuals’ pursuit of reasonable conceptions of the good.
D2. Neutrality across reasonable conceptions of the good.
Liberal societies, aim to set up policies and institutions that achieve D1 and D2, as long as those
29
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 30

institutions can be reconciled with social order. 17 We roughly view “social order” as a feasible
and sustainable set of arrangements (one that does not undermine itself) and as to institutions,
we leave them at the level of abstraction of the mechanisms we described paired with some of the
user interface and security considerations we highlighted.
From its foundations in Enlightenment thinking to its successes guiding the French and Amer-
ican Revolutions, liberalism has been forced to contend with the problem of collective organiza-
tion. How can a government, committed to ensuring that individuals have the ability to pursue
their own conceptions of the good, sustain collective organization of any sort? We call this prob-
lem for liberalism the Communitarian Critique: 18 A state cannot sustain the communities valued by
individuals while remaining neutral among their competing conceptions of the good life.
Recall from §3 the suboptimal funding mechanism which we called Capitalism. Under Cap-
italism, individuals contribute to the public good according to how much they value it. This
mechanism illustrates the problem with liberalism in its purest form, and substantiates the Com-
munitarian Critique. The Capitalist mechanism allows for the funding of a public good to operate
exactly like the funding of a private good. This system is procedurally neutral across individu-
als’ competing conceptions of the good because it confers on individuals the freedom to contribute
however much they can to goods that they value. The procedure for funding public goods, accord-
ing to the capitalist mechanism, theoretically allows individuals to express via their contributions
exactly how much they value the good in question.
Because the level of funding of a public good cannot scale with the number of individuals who
beneﬁt from the good, the mechanism leads to severe underfunding. Thus, as the Communitarian
Critique goes, there is a bias against funding goods that may be valued by more than one person.
Underfunding in the capitalist mechanism leads to fractionalization—as individuals ﬁnd them-
selves unable to enjoy goods of value to groups, they are left to place greater weight on goods
valued only to themselves.
How does democratic governance respond to—and fail to respond to—the Communitarian
Critique? The “1p1v” mechanism for funding public goods holds some hints. In 1p1v, as in demo-
cratic governance, individuals vote on whether they value a public good, with each individual
allowed to cast exactly one vote, and then the public good is funded entirely through taxes and
transfers. This mechanism still contains an important dose of liberal spirit in that it is procedu-
rally neutral. There is nothing in the procedure that prevents individuals from expressing, via a
referendum, whether they value the good in question.
And yet, 1p1v is suboptimal from an efﬁciency standpoint, as we saw, because the median is
often a poor approximation for the mean. Thus, 1p1v may lead to overfunding or underfunding of
a public good. But one thing is certain: 1p1v is systematically biased against public goods valued
by a small minority community. While it is far older, for resonance with contemporary debates we
call this criticism the Multiculturalist Critique: Standard demoracy leads to systematic biases against
minority groups and communities.
17Of course these two desiderata on their own leave many ethical, political, and epistemological questions open for
debate. What constitutes a reasonable conception of how to live? With what degree of social order must D1 and D2 be
compatible? How does one judge whether satisfactory social order has been achieved? What sorts of social institutions
most successfully achieve D1 and D2? Answering these and related questions has kept several centuries of liberal
theorists busy, so we do not attempt to address them here.
18While we choose this term for resonances with the liberal-communitarian debate, we are more interested in under-
standing how liberalism falls short of its own goals, rather than how it may strike a compromise between fundamentally
illiberal modes of thought. The liberal-communitarian debate. We are interested in communitarian critiquest to the ex-
tent that the development of liberalism—in politics and philosophy—can be understood as a sequence of proposals for
new ways of resolving practical and theoretical worries from a broadly communitiarian perspective, while holding fast
to liberal ideals.
30
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 31

1p1v democracy goes part of the way toward resolving the Communitarian Critique but intro-
duces the Multiculturalist Critique. 1p1v has advantages over the Capitalist mechanism, and yet
presents problems of its own. What is clear in both systems is that liberalism (i.e. a commitment
to neutrality) undermines minority interests. Capitalism underfunds all communities, while 1p1v
suppresses minority voices. 1p1v democracy is a blunt tool for resolving the competing demands
of factions and subgroups of a citizenry. At best, it goes part of the way toward resolving the
deep central tension of liberalism. At worst, it is fundamentally illiberal, allowing for no diver-
sity among communities. If some semblance of liberalism is to be rescued under democracy, it
will require the granting of basic rights to individuals and communities, which is difﬁcult (if not
impossible) to do in a neutral way.
The LR mechanism, with its formal advantages over Capitalism and 1p1v, may answer accord-
ingly to both critiques of liberalism discussed above. We showed formally that LR is the optimal
mechanism. It allows for the funding of public goods valued in small communities, thus it is not
systematically biased against minority interests. It also maintains neutrality among competing
interests.
Consequently, Liberal Radicalism, a political philosophy based in the LR mechanism, may re-
solve an important aspect of the abiding disagreement between liberalism and its critics. Our
formal analysis is grounded in positions advanced by liberal thinkers who were attentive to com-
munitarian concerns throughout the history of liberalism. Notably, Alexis de Tocqueville’s po-
litical theory, stemming from his own resolution of the frictions he observed between liberalism
and democracy, is a historical precedent for LR. Tocqueville argued that localized collective orga-
nization is necessary, but if society becomes so localized so as to be atomistic, liberal resistance to
central authority is impossible. Similar ideas were also advanced by later liberal thinkers, notably
Henry George, Beatrice and Sidney Webb and Hannah Arendt.
The name “radicalism” is particularly associated with these ﬁrst two and “radical” parties
such as the Danish Radikale Venstre and the various Radical parties led by Georges Clemenceau
in France, as well as the “new Liberal” party of David Lloyd George in England, drew much of
their inspiration from these ideas. George and the Webbs, writing in response to rise of indus-
trialism, both advanced reforms that align with our presentation of Liberal Radicalism. George
(1879) held that the agglomeration and community necessary for cities and commerce, ignored
by previous economists, had been perverted by individualism as a basis for market power and
rents that fueled inequality and held resources away from their best uses. He argued that these
rents from communities belonged to these communities collectively and ought to be taxed in or-
der to fund community-oriented public goods, an idea which is encapsulated by his eponymous
theorem discussed in §5.5. The resonance with and direct relevance to LR is clear.
The Webbs (1897) applied similar insights to the agglomerations of business capital that, be-
cause of economies of scale, could not simply be broken up as antitrust authorities in the US (in-
spired by George) attempted. They argued that corporations were the collective creations of net-
works of association and cooperation among their workers and that the fruits of these communi-
ties were wastefully captured and dominated by the capitalist ﬁnanciers of these enterprises. They
argued for “industrial democracy” in which labor unions and other democratically-governed
overlapping intermediary organizations would help check and channel the power of corporate
interests. Such an ecosystem draws on Tocqueville’s insights about the importance of community
to liberalism while connecting it to industrial society and is precisely the sort of ecosystem LR
seeks to foster.
Arendt (1951) picked up most directly Tocqueville’s ideas. She applied Tocqueville’s criticisms
to the extreme capitalism and unchecked democracy of the interwar period, arguing that the rise
of totalitarianism was a result of excessive atomization that left the national democratic commu-
31
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 32

nity as the only basis for collective organization. Atomized individuals desperate for community
and left by liberalism only with a national state as a locus for it, embraced the unmediated and
unlimited connection to the state that totalitarianism offered. Capitalism and democracy thus,
without further layers of organization, led to their opposite.
Contemporary liberal thinkers have tried to respond to the challenges of multiculturalism and
identity politics in a similar spirit. For example, both in his scholarly work (2005) and in his more
popular writing (2006), Kwame Anthony Appiah has sought to build a liberal philosophy that is
deeply engaged with the richness of human identity and community and yet which resists essen-
tialist or eternal claims of such groups to allow for a liberal, free-ﬂowing and evolving deﬁnition
of identities that serve individuals. It is precisely this spirit that LR is intended to manifest.
§8 Conclusion
The title of this paper and the name of our mechanism is at least a quintuple entendre. First,
literally, it describes the mechanism, which uses the radical (viz. square root) to create a liberal
funding regime for collective goods. Second, as we described in §7 above, our vision here is closely
related to that of the Radical liberal tradition and thus it is a direct historical-ideological reference.
Third, it is radical in the current common usage sense that it would fundamentally change the
institutions of existing capitalism and one-person-one-vote if it were implemented.
Yet, most importantly, it is a radical form of liberalism in two senses with deep resonance in the
history of political thought. As we saw in the previous section, there has long been a tradition of
“radical political thought”, much of it in the communitarian or continental tradition, that critiques
traditional liberalism for ignoring the fundamentally social nature of human life. To a large extent,
liberals have ignored or elided such critiques and championed superﬁcially liberal institutions like
capitalism or 1p1v democracy that sound neutral and anti-authoritarian but whose effects can be
quite opposite in the world we actually live in, where many of these “radical” critiques hold. In
such a world, such systems typically lead to monopolies and the tyranny of majority groups.
Liberal Radicalism at its core is an attempt to take seriously these critiques and build a form of
liberalism that seeks to achieve liberal ends in a fundamentally social world. In this sense it is also
“radical” in the original meaning: it gets to the roots of what liberalism is about, in our account,
namely an anti-authoritarian commitment to neutrality across ways of living and valuing. It thus
eschews superﬁcially liberal institutions that do not, given evident force of the radical critiques,
achieve liberal goals. Further, it enables a vision of a different social organization that plays out
the fundamental ideas of liberalism much more completely.
It is this last aspect that strikes us as the most exciting direction in the long-term for our ideas
here. So much of the liberal order at present is a rigid set of kludges designed to balance compet-
ing levels of social organization in roughly the way that Liberal Radicalism aims to, but without
nearly the ﬂuidity the Liberal Radical mechanism offers. Usually these attempts succeed for a pe-
riod, but in the medium-term end up themselves becoming authoritarian impediments to change.
Consider:
1. The modern nation state was largely an outgrowth of liberal movements demanding some
form of self-determination, but ended up idolizing an organic vision of nationality that has
become one of the greatest enemies of liberalism.
2. Liberal governmental structures aimed at protecting minorities, from the byzantine checks
and balances of the American constitution to the bizarre religiously-apportioned power-
32
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 33

sharing arrangements in Lebanon, have to a surprising degree succeeded in keeping the
peace, but have deeply entrenched historical divisions by hard-coding them.
3. Geographical hierarchies of government (local, state, provincial, etc.) have been a powerful
tool for liberals to decentralize power, yet have themselves become oddly outdated and rigid
structures in a world where collaboration is often organized by social networks, trade ﬂows
and cultural communities rather than by physical space.
The greatest hope we hold out for Liberal Radicalism in the long-term is that it offers an al-
ternative to this awkward dance of capitalist atomization coupled with overlapping checks and
balances among various rigid levels of collective organization. By allowing and optimally en-
couraging existing communities to act together, it preserves the crucial role of collective action.
Yet by avoiding any ﬁxed role for any predetermined organization, it allows ﬂuid change and
reformation of different social groupings as societies evolve.
However, before it can hope to achieve such a lofty vision, far more thought, communication,
experimentation, and organization will be necessary. We brieﬂy conclude with some things we
hope to see along each of these dimensions in the coming years.
In the category of ideas and research, our treatment of the economic theory around the LR
mechanism was extremely superﬁcial: its analysis is based on simpliﬁed assumptions of complete
information; there is signiﬁcant room for improvement in the analysis of the ﬁnancing mechanism
and deﬁcits’ inﬂuence on incentives; our discussion of collusion is superﬁcial and our results on
how to deter it are thin. Moreover, we do not even touch distributive issues. More ambitiously,
the vision we sketched about the relationship of the Henry George Theorem to the possibility of
funding LR through efﬁciency-enhancing taxes on decreasing returns activities is still very vague
and should be examined in much greater detail.
Beyond economic theory, there are countless philosophical, sociological, design and political
questions our discussion leaves open. How can LR reﬂect and respond to the feminist critique
of capitalist individualism and family hierarchy? How would LR change social attitudes, inter-
actions and ethical standards? What can be done to further defend it from attacks and hacks?
What would political parties and activist organization look like under LR? More broadly, would
LR optimally encourage community formation or would the norms and rules needed to avoid
collusion inadvertently undermine important communities? Is it possible to make wide publics
largely unfamiliar with mathematics comfortable with the LR mechanism?
It is on this last point where the input of artists, communicators and designers will be most
important. LR is in some ways resonant with a wide range of familiar themes in the history of
liberal politics. Yet its formal structure and speciﬁc form will initially strike many as bizarre. De-
signing interfaces, helping the public to “see” what a LR society might be like, educating citizens
about how to effectively interact with it, educating philanthropists about its uses and more will be
critical to making it a pervasive part of the consciousness of the public.
We have laid out a variety of narrower domains in which we anticipate experimentation in the
near term. Such experimentation is critical for a variety of reasons: to investigate the weaknesses
of the formal mechanisms and address these ﬂaws with new designs, to acquaint people with their
operation and build awareness of their value, to build social institutions around them that make
them effective, and to provide rigorous empirical evidence of their value.
We expect and hope for a wide range of such experimentation around LR. The most likely
ﬁrst application will be open source software communities, which are very open to experiments
with new algorithms, especially ones that change social dynamics; cryptocurrency communities
seem particularly appropriate. In fact, one such organization, WeSpring, has already run a dona-
33
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 34

tion matching campaign for 501(c)3 nonproﬁts.19 However, we are also hopeful that a variety of
philanthropists, especially those that made their money in the technology world, will seek to use
such mechanisms to fund a wide range of activities currently covered by charities. The Open Phi-
lanthropy and “effective altruism” movements are based on the idea that donor discretion should
be removed to the extent possible from philanthropy. In areas where randomized controlled tri-
als and other precise measurements are insufﬁcient to direct funds, LR seems well-suited to this
philosophy.
19See Allison Berreman’s December 8, 2018 article for ETHNews "WeTrust Experiments With Liberal Radical Dona-
tion Matching" here: https://www.ethnews.com/wetrust-experiments-with-liberal-radical-donation-matching.
34
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 35

References
Ackerman, Bruce and Ian Ayres, Voting with Dollars: A New Paradigm for Campaign Finance , New
Haven, CT: Yale University Press, 2002.
Alesina, Alberto and Enrico Spolaore, “On the Number and Size of Nations,” Quarterly Journal of
Economics, 1997, 107 (4), 1027–1056.
Appiah, Kwame Anthony, The Ethics of Identity, Princeton, NJ: Princeton Univeresity Press, 2005.
, Cosmopolitanism: Ethics in a World of Strangers, New York: W. W. Norton, 2006.
Arendt, Hannah, Origins of Totalitarianism, Berlin: Schocken Books, 1951.
Arnott, Richard, “Taxi Travel Should be Subsidized,” Journal of Urban Economics, 1996, 40 (1), 316–
333.
, “William Vickrey: Contributions to Public Policy,” International Tax and Public Finance, 1998, 5
(1), 93–113.
and Joseph Stiglitz, “Aggregate Land Rents, Expenditure on Public Goods, and Optimal City
Size,” Quarterly Journal of Economics, 1979, 93 (4), 471–500.
Atkinson, A. B. and J. E. Stiglitz, “The Design of Tax Structure: Direct Versus Indirect Taxation,”
Journal of Public Economics, 1976, 6 (1–2), 55–75.
Benkler, Yochai, The Wealth of Networks: How Social Production Transforms Markets and Freedom ,
New Haven, CT: Yale University Press, 2007.
Bergstrom, Ted, “Do Governments Spend Too Much,” National Tax Journal, 1979, 32 (2), 81–86.
, “When Does Majority Rule Supply Public Goods Efﬁciently?,”Scandinavian Journal of Ecnomics,
1979, 81 (2), 216–226.
Bergstrom, Theodore, Lawrence Blume, and Hal Varian , “On the Private Provision of Public
Goods,” Journal of Public Economics, 1986, 29 (1), 25–49.
Bowen, Howard R., “The Interpretation of Voting in the Allocation of Economic Resources,”Quar-
terly Journal of Economics, 1943, 58 (1), 27–48.
Clarke, Edward H., “Multipart Pricing of Public Goods,” Public Choice, 1971, 11 (1), 17–33.
Dybvig, Phillip H. and Chester S. Spatt , “Adoption Externalities as Public Goods,” Journal of
Public Economics, 1983, 20 (2), 231–247.
Easterly, William, The White Man’s Burden: Why the West’s Efforts to Aid the Rest Have Done So Much
Ill and So Little Good, Oxford: Oxford University Press, 2007.
Eguia, Jon X. and Dimitrios Xefteris , “Implementation by Vote-Buying Mechanisms,” 2018.
https://ssrn.com/abstract=3138614.
Foer, Franklin, World Without Mind: The Existential Threat of Big Tech, New York: Penguin, 2017.
Galbraith, John, The Afﬂuent Society, Boston: Houghton Mifﬂin, 1958.
35
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 36

George, Henry, Progress and Poverty, New York: Appleton, 1879.
Giriharadas, Anand, Winners Take All: The Elite Charade of Changing the World, New York: A. Knopf,
2018.
Groves, Theodore, “Incentives in Teams,” Econometrica, 1973, 41 (4), 617–631.
and John Ledyard, “Optimal Allocation of Public Goods: A Solution to the “Free Rider” Prob-
lem,” Econometrica, 1977, 45 (4), 783–809.
Harberger, Arnold C. , “Issues of Tax Reform in Latin America,” in “Fiscal Policy for Economic
Growth in Latin America: Papers and Proceedings of a Conference Held in Santiago, Chile,
December, 1962,” Baltimore, MD: Johns Hopkins University Press, 1965.
Harvey, David, Social Justice and the City (Revised Edition), University of Georgia Press, 2009.
Hasen, Richard L, Plutocrats United: Campaign Money, the Supreme court, and the Distortion of Amer-
ican Elections, Yale University Press, 2016.
Hylland, Aanund and Richard Zeckhauser, “The Efﬁcient Allocation of Individuals to Positions,”
Journal of Political Economy, 1979, 87 (2), 293–314.
Jacobs, Jane, The Death and Life of Great American Cities, New York: Random House, 1961.
Juels, Ari, Dario Catalano, and Markus Jakobsson, “Coercion-Resistant Electronic Elections,” in
David Chaum, Markus Jakobsson, Ronald L. Rivest, Peter Y. A. Ryan, Josh Benaloh, Miroslaw
Kutylowski, and Ben Adida, eds., Towards Trustworthy Elections: New Directions in Electronic
Voting, Vol. 6000 of Lecture Notes in Computer Science, Amsterdam: Springer, 2010.
Kant, Immanuel, Grounding for the Metaphysics of Morals, tr. James Ellington , Hackett Publishing
[1993], 1785.
Krugman, Paul, “Increasing Returns and Economic Geography,” Journal of Political Economy, 1991,
99 (3), 483–499.
Lalley, Steven P . and E. Glen Weyl , “Nash Equilibria for Quadratic Voting,” 2018.
https://arxiv.org/abs/1409.0264.
Lanier, Jaron, Who Owns the Future?, New York: Simon & Schuster, 2013.
Lessig, Lawrence, Republic, Lost: How Money Corrupts Congress – and a Plan to Stop It , New York:
Twelve, 2011.
Madison, James, “The Federalist No. 10: The Utility of the Union as a Safeguard Against Domestic
Faction and Insurrection,” Daily Advertiser, 1787, Thursday, November 22.
Mailath, George J. and Andrew Postlewaite , “Asymmetric Information Bargaining Problems
with Many Agents,” Review of Economic Studies, 1990, 57 (3), 351–367.
Olson, Mancur, The Logic of Collective Action, Cambridge, MA: Harvard University Press, 1965.
Ostrom, Elinor, “Governing the Commons: The Evolution of Institutions for Collective Action,”
1990.
36
Electronic copy available at: https://ssrn.com/abstract=3243656

---

## Page 37

Park, Sunoo and Ronald L. Rivest , “Towards Secure Quadratic Voting,” Public
Choice Special Issue: Quadratic Voting and the Public Good , 2017, 172 (1–2), 151–175.
https://eprint.iacr.org/2016/400.pdf.
Posner, Eric A. and E. Glen Weyl, “Introduction,” Public Choice Special Issue: Quadratic Voting and
the Public Good, 2017, 172 (1–2), 1–22.
and , Radical Markets: Uprooting Property and Democracy for a Just Society, Princeton, NJ: Prince-
ton Univeresity Press, 2018.
Ramsey, F. P ., “A Contribution to the Theory of Taxation,” Economic Journal, 1927, 37 (145), 47–61.
Reich, Rob, Just Giving: Why Philanthropy is Failing Democracy and How It Can Do Better, Princeton
University Press, 2018.
Roemer, John E., “Kantian Equilibrium,” Scandinavian Journal of Economics, 2010, 112 (1).
Romer, Paul M, “Increasing Returns and Long-run Growth,” Journal of Political Economy, 1986, 94
(5), 1002–1037.
Rothkopf, Michael H., “Thirteen Reasons Why the Vickrey-Clarke-Groves Process is Not Practi-
cal,” Operations Research, 2007, 55 (2), 191–197.
Samuelson, Paul A., “The Pure Theory of Public Expenditure,” Review of Economics and Statistics,
1954, 36 (4), 387–389.
Stiglitz, Joseph , “The Theory of Local Public Goods,” in Martin S. Feldstein and Robert P . In-
man, eds., The Economis of Public Services: Proceedings of a Conference held by the International Eco-
nomic Association in Turin, Italy, International Economic Association Conference Volumes 1977,
pp. 274–333.
Tabarrok, Alexander, “The Private Provision of Public Goods via Dominant Assurance Con-
tracts,” Public Choice, 1998, 96 (1–2), 345–362.
Vickrey, William, “Counterspeculation, Auctions and Competitive Sealed Tenders,” Journal of
Finance, 1961, 16 (1), 8–37.
, “The City as a Firm,” in Martin S. Feldstein and Robert P . Inman, eds., The Economics of Public
Services: Proceedings of a Conference held by the International Economic Association at Turin, Italy ,
International Economic Association Conference Volumes Amsterdam: Springer 1977.
Webb, Sidney and Beatrice Webb, Industrial Democracy, London: Longmans, Green and Co., 1897.
Weyl, E. Glen, “Quadratic Vote Buying,” 2012. http://goo.gl/8YEO73.
and Anthony Lee Zhang, “Depreciating Licenses,” 2018. https://ssrn.com/abstract=2744810.
37
Electronic copy available at: https://ssrn.com/abstract=3243656

---
