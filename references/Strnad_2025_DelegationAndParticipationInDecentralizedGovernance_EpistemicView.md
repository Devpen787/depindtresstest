# Strnad_2025_DelegationAndParticipationInDecentralizedGovernance_EpistemicView.pdf

## Page 1

arXiv:2505.04136v1  [cs.SI]  7 May 2025
Delegation and Participation in Decentralized
Governance: An Epistemic View
Jeff Strnad∗
Abstract
We develop and apply epistemic tests to various decentralized gov-
ernance methods as well as to study the impact of participation. These
tests probe the ability to reach a correct outcome when there is one.
We find that partial abstention is a strong governance method from an
epistemic standpoint compared to alternatives such as various forms
of “transfer delegation” in which voters explicitly transfer some or all
of their voting rights to others. We make a stronger case for multi-step
transfer delegation than is present in previous work but also demon-
strate that transfer delegation has inherent epistemic weaknesses. We
show that enhanced direct participation, voters exercising their own
voting rights, can have a variety of epistemic impacts, some very nega-
tive. We identify governance conditions under which additional direct
participation is guaranteed to do no epistemic harm and is likely to
increase the probability of making correct decisions. In light of the
epistemic challenges of voting-based decentralized governance, we con-
sider the possible supplementary use of prediction markets, auctions,
and AI agents to improve outcomes. All these results are significant
because epistemic performance matters if entities such as DAOs (de-
centralized autonomous organizations) wish to compete with organi-
zations that are more centralized.
May 6, 2025 Version
©Jeff Strnad
∗Charles A. Beardsley Professor of Law, Stanford University. I am grateful for com-
ments from participants at the 2024 Equitable Tech Summit on early versions of some of
the results and from Yann Aouidef. Bill Eskridge, Leo Glisic, and Takuma Iwasaki.

---

## Page 2

Contents
1 Introduction 1
2 Analytic Framework 4
2.1 An Epistemic Approach . . . . . . . . . . . . . . . . . . . . . 4
2.2 A Base Model and Two Epistemic Tests . . . . . . . . . . . . 8
2.2.1 Base Model . . . . . . . . . . . . . . . . . . . . . . . . 8
2.2.2 Independent Competencies Test . . . . . . . . . . . . . 9
2.2.3 Dependent Competencies Test . . . . . . . . . . . . . . 11
2.3 Coherent Terminology . . . . . . . . . . . . . . . . . . . . . . 14
3 Delegation by Partial Abstention 16
4 Direct Participation 25
5 Transfer Delegation 38
5.1 List-based Transfer Delegation . . . . . . . . . . . . . . . . . . 40
5.2 Transfer Delegation in One Step or a Finite Number of Steps . 42
5.3 Transfer Delegation with Unlimited Steps: Liquid Democracy 46
5.4 Sortition . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 55
5.5 The Delegate Slate . . . . . . . . . . . . . . . . . . . . . . . . 57
6 Shades of Decentralization and Epistemic Supplements 58
6.1 Systematic Independent Transfer Delegation by Whales . . . . 58
6.2 Futarchy . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 61
6.3 Condorcet AI Agents . . . . . . . . . . . . . . . . . . . . . . . 62
6.4 Contestable Control . . . . . . . . . . . . . . . . . . . . . . . . 63
7 Conclusion 66

---

## Page 3

1 Introduction
Decentralized Autonomous Organizations (“DAOs”) operate largely through
the execution of code and have no centralized management. When partici-
pant decisions are required, DAOs typically utilize majority voting by token
holders with one vote per token. In most cases, the voting rights are publicly
traded.
Decentralization, defined as the ability for the token project to operate in
the absence of trusted parties, is a desideratum for DAOs. Trustlessness is a
major potential benefit because trusted parties may betray the trust put in
them due to conflicts of interest, bias, or outright dishonesty, each of which
may imperil the project or diminish its performance.
Despite the potential benefits of trustlessness, there is the possibility that
centralized approaches will result in more effective project management. If
the ensuing competitive disadvantage is severe enough, DAOs will not be
a viable option. In the ensuing debate, a counterargument, appearing, for
example, in Buterin (2022), is that in some contexts, decentralized manage-
ment will be superior because of the wisdom of crowds . Roughly speaking,
when decision authority is dispersed, the aggregation of knowledge through
the collective judgment of the many expressed through voting or otherwise
may dominate decisions by one or only a handful of managers.
Motivations for decentralization extend beyond the possibility of exploit-
ing the wisdom of crowds. Perhaps most prominent are web3 ideals, well
described in Dixon (2024). A starting point for these ideals is the obser-
vation that during “web2,” the previous stage, a small group of companies
gained substantial power and control by leveraging network economies of
scale to become the primary parties intermediating the internet. This lever-
age gave them the power to extract valuable information from large groups
of people for free, to censor and exploit creators who depend on internet au-
diences, to constrain the speech of internet users, and to control or heavily
influence what content internet users see. In contrast, a core element of web3
is “democratizing ownership” with the ultimate goal of placing economic and
governance power in the hands of users while retaining the competitive and
efficiency advantages of corporate networks. This goal raises exactly the co-
nundrum that is the major focus of this paper: how to create governance that
is both decentralized and efficient enough to be competitive with centralized
alternatives.
1

---

## Page 4

Participation has emerged as a major concern for DAOs. For the vast
majority of projects, voter participation is very low and in many cases it is
clear that a small group of actively engaged parties, including typically, some
large holders, predominate in governance. 1 There are many sound reasons
not to vote. Consider three of them. First, small holders have little economic
incentive to become informed. As a result, if there are only small holders,
there is likely to be a serious collective action problem. Relatively few voters
become well informed, and DAO functioning suffers. Second, and related,
small holders face the “paradox of voting.” Voting is costly, but with a small
stake, there is only a very small chance that the stakeholder’s vote will be
decisive. Third, some DAO token owners will be portfolio investors, holding
a large number of different positions for the purpose of diversification. It will
be difficult and costly for them to participate in governance of all or even
more than a few of the projects. In addition, an important motivation for
diversification is to avoid relying on superior outcomes for particular projects
and the consequent need to study and choose among them.
Prominent academics and industry participants see explicit delegation of
voting rights to others as a possible way both to address low participation
and to direct voting power to more informed and competent voters. 2 In
addition, there has been substantial interest in the nature of delegation itself
and in possible innovations such as the use of liquid democracy, which permits
unlimited delegation and re-delegation of votes.
In the rest of the paper, we focus on decentralization, the wisdom of
crowds, participation, and delegation. We claim that the relationship be-
tween them is more complex than appears from the existing literature. De-
centralization does not necessarily advance the wisdom of crowds. Many
methods of delegation are problematic. Increased participation is not neces-
1Feichtinger et al. (2023, pp. 5-6, 8) document very low Nakamoto coefficients, express-
ing the minimum number of token holders or delegates with more than half the voting
rights, for a sample of 21 DAOs, including many of the most prominent ones. 17 of the 21
DAOs have either a delegate or token holder Nakamoto coefficient of less than 10. They
also find very low participation rates for token holders. Liu (2023) finds similar levels of
both concentrated control and low participation in a sample of 50 DAOs, and Fritsch et al.
(2024) identify similar patterns for Uniswap and Compound in a more detailed examina-
tion of 3 DAOs.
2See, e.g., Hall and Miyazaki (2024)(discussing the idea, some of the associated liter-
ature, and providing a cogent empirical analysis of the operation of liquid democracy in
DAO governance, including the impact on participation).
2

---

## Page 5

sarily desirable. 3 Methods that include partial abstention may be superior
to common approaches that rely on explicit delegation of voting rights to
others.
The analytic approach underlying these claims is based on two epistemic
tests and is closely related to the wisdom of crowds. These tests consider
a choice between two alternatives, one of which is correct, and assess how
well various governance approaches aggregate information from a diversity
of voters to maximize the probability of making a correct collective decision.
The first test assumes that voter judgments are independent of each other.
The second test permits any pattern of dependencies. Regardless of the test,
we make very strong assumptions about each voter’s ability to assess the
quality of their information. In particular, voters can translate any collection
of information into a precise estimate of the probability of reaching the correct
collective decision based on that information.
This framework is extremely limited because of the associated strong as-
sumptions, including assuming that there is a correct answer and that voters
are perfect judges of the quality of their information. In effect, the tests we
apply make it particularly easy for governance approaches to be successful.
If a governance approach performs poorly in these simple situations, it is
unlikely to be a good or useful approach. The tests in fact reveal substan-
tial weaknesses in some prominent approaches. In addition, the tests create
considerable insights about such approaches that transcend the limitations
inherent in the framework.
The next section describes the two tests and the underlying epistemic
framework and concludes with a terminology subsection. The third section
discusses methods that rely on partial abstention, the ability of voters to
exercise only a portion of their voting rights. The fourth sections studies
participation by voting directly, especially the epistemic impact of adding
new voters. The fifth section focuses on explicit delegation of voting rights to
others. The sixth section examines some non-voting supplements to token-
based voting arrangements that may significantly improve governance. A
final section concludes.
3Some prominent parties active in the DAO space have expressed skepticism about
promoting participation in an undifferentiated way. For example, Spannocchi (2025), in
thoughtful article, describes various DAO participants and discusses in detail the pluses
and minuses of their participation in governance. The results here are very consistent with
that kind of nuanced viewpoint.
3

---

## Page 6

The results and analysis in the paper apply to decentralized governance
in general, whether or not implemented using DAOs. Nonetheless, we pay
special attention to DAOs both because they are important applications of
decentralized governance and because a focus on DAOs often facilitates the
exposition of more general ideas.
2 Analytic Framework
2.1 An Epistemic Approach
One way to formalize the wisdom of crowds phenomenon is through “jury
theorems.” A good conceptual starting point is the earliest result due to
de Condorcet (1785), often called Condorcet’s Jury Theorem . This result
assumes a dichotomous choice by majority vote, which is a determinable
decision in the sense that one of the two alternatives is the right one and the
other is wrong.
Condorcet’s Jury Theorem consists of the following. Assume that voters
have equal probabilities, p = 0.5 + ϵ for some ϵ > 0, no matter how small,
of making the right decision and that their judgments are statistically in-
dependent. Using the terminology of Dietrich and Spiekermann (2023), two
conclusions follow:
1) Increasing Reliability: The probability that the majority-vote collective
decision will be correct is increasing in the number of voters.
2) Asymptotic Infallibility : As the number of voters increases to infinity,
the probability that the collective decision will be correct converges to
1.
Thus, majority voting by a sufficiently large number of independently in-
formed people each of whom is only a little better than a coin flip at coming
up with the correct alternative will dominate any finite group of decision-
makers unless at least one decisionmaker in that group has substantive om-
niscience, that is, p = 1.
Although Condorcet’s Jury Theorem is a cogent conceptual illustration
of the wisdom of crowds, it is limited in scope due to the Theorem’s restric-
tive assumptions: All voters have the same competence, the correctness of
judgments are statistically independent, and the asymptotic result depends
4

---

## Page 7

on having a very large number of individuals. Both epistemic tests we de-
velop relax the assumption of equal competencies and one of them relaxes
the assumption of statistical independence. Furthermore, most of the results
we derive do not depend on the number of voters.
The epistemic framework that applies to both tests and much of the en-
suing analysis relies on several other major assumptions. We list and discuss
them in the rest of this subsection. A first assumption we already have en-
countered:
Assumption 1 (Determinable Decisions): Decisions are determinable.
There is a single correct answer.
This assumption is a substantial limitation. Dietrich and Spiekermann
(2023, p. 27) note that the idea that “alternatives are factually correct or
incorrect” is a “controversial philosophical premise.” They discuss some of
the literature surrounding the question of whether “correctness facts” and
thus determinable decisions exist, especially in domains that involve political
or moral decisions or a mixture of empirical and normative elements.
Nonetheless, there are two reasons to proceed with this assumption. First,
we would like DAOs to perform well when the decisions they make are de-
terminate. Certain technical questions, for example, plausibly have a correct
answer, albeit subject to current uncertainty. Second, we will show in sub-
section 6.4 that this assumption may be appropriate in the case of what we
call “economic DAOs.” For these DAOs, the market token price can embody
many normative, political, or moral elements such as the value of partici-
pation for which there is no correct answer at the level of reasoning alone.
In the case of economic DAOs, the right answer arguably is the one that
maximizes the market price.
In their overview of jury theorems, Dietrich and Spiekermann (2023, p.
35) point out that “conventional jury models implicitly assume that individ-
uals share the same objective of a correct collective decision.” That is our
second assumption:
Assumption 2 (Shared Epistemic Objective): Voters share the
same epistemic objective: reaching correct collective decisions.
This assumption makes it much easier to define an effective governance
mechanism in at least two significant ways. First, the assumption rules out
5

---

## Page 8

malicious actors and actions. It is unrealistic to ignore potential malicious
behavior and attacks, but not having to address these potentialities makes
the governance design problem much simpler.
Second, the assumption means that we do not have to worry about the
possibility that some voters may choose to assert their own beliefs about
correctness without giving due weight to others in a way that will maximize
the probability of a collective decisions being correct. Instead, voters will try
to facilitate inclusion of contrary views if that will increase the likelihood of
a correct collective decision.
A different situation occurs when voters have instrumental objectives in-
stead of a shared epistemic objective. Asserting one’s own beliefs is one
example of an instrumental objective. More generally, when there is no cor-
rect collective decision, the social choice process is at least in part engaged
in preference aggregation rather than information aggregation. In that sit-
uation, voters will focus on clarifying and promoting their preferences. For
example, Bloembergen et al. (2019) model voters who are not sure of their
preference in a binary choice and delegate to others who are likely to dis-
cern and vote for their preference. A few of the results in later parts of this
paper will apply both when there is a shared epistemic objective and when
voters implement instrumental objectives. We will note when that is the
case. In many other instances, Assumption 2, that there is shared epistemic
objective, will be a necessary condition for the results to hold.
A third major assumption concerns the voters that comprise the govern-
ing population along with their information and beliefs:
Assumption 3 (Cognizable Probabilities): Voters can evaluate their
total information set or any subset thereof and compute an accurate proba-
bility that they can choose the correct decision alternative based on that set
or subset of information.
This assumption is very strong and has major implications. First, there
is no reason to worry about voters being more likely wrong than right when
they vote. Under the assumption, a voter who is thinking of voting for A over
B based on particular information knows the probability of that inclination
being correct. If the probability is less than 0 .50, then they will vote for
B given that they share the epistemic objective of promoting the correct
collective decision. Each vote based on each information set will have a
probability ≥ 0.5 of being correct.
6

---

## Page 9

This implication of the assumption is important because the danger that
voters have a degree of ignorance that makes them less likely than a coin flip
to be correct is a major concern for voting systems and makes it much harder
to design an effective governance mechanism. For example, it is an element
of the critique of majority voting in Brennan (2016) based on the associated
risk that majority voting will lead to defective outcomes. In the context of
Condorcet’s Jury Theorem, if the common probability of each voter being
correct is less than 0 .5, then adding voters will increase the probability of
making the wrong decision and that probability will converge to one as the
number of voters increases without bound.
Second, this assumption means that when two voters receive the same
information, they will agree on the implications of that information for the
probability of voting for the correct decision. This property makes it much
easier to address the situation in which voter judgments are not statistically
independent. A further assumption also facilitates addressing dependencies:
Assumption 4 (Information Decomposition): The totality of infor-
mation received by voters can be decomposed into a “canonical list” with two
properties. First, each item of information on the list is statistically indepen-
dent from all other items on the list. Second, each voter’s information set is
a sum of items on the list.
This assumption allows us to address the situation of dependencies be-
tween voter judgments by focusing instead on a series of independent signals,
the items on the canonical list. This approach greatly simplifies the analy-
sis, provides great clarity with respect to some governance approaches, and
suggests ways of addressing dependencies in the field. 4
4The independent signals approach here is inspired in part by Dietrich and Spiekermann
(2024), who developed a similar approach to address the epistemic impact of deliberation
in a one-person-one-vote majority voting context. Deliberation creates dependencies when
individuals share sources. Dietrich and Spiekermann (2024) show that the overall impact
of deliberation is not clear. Consider two simple examples, one negative and the other
positive. If a particular signal, x, spreads easily through deliberation and other signals
do not, the epistemic quality of collective decisions can suffer. If the result is that most
or all voters receive x, then it will tend to drown out the other signals. The outcome
can be a dependency pattern such as the one described in Example 2.1 on page 11 infra,
which, as the example indicates, can have a very negative epistemic impact. In contrast,
if deliberation causes all voters to receive all the signals on the canonical list, then every
7

---

## Page 10

These four assumptions are very strong both individually and collectively.
Separately and together, they make it much more likely that governance
approaches will be effective. That thumb on the scale is a major defect if
we base an argument for the effectiveness of any approach on an analysis
that relies on the assumptions. However, what we find is that many major
governance approaches have substantial weaknesses even in the face of these
helpful assumptions.
Finally, there is a more general purpose for using these restrictive as-
sumptions as well as for focusing on two epistemic tests rather than a more
general model. The assumptions and the tests create a simple enough con-
text to make the underpinnings of various results very clear but rich enough
to have obvious generality. At some points, we consider extensions that
broaden the context. Throughout, we use examples in an attempt to create
clear understanding and intuition.
2.2 A Base Model and Two Epistemic Tests
2.2.1 Base Model
Define V to be the voter profile, a list of N voters indexed by i of all persons
who have voting rights through token ownership or delegation along with
the number of voting rights, ti, that each such person i holds. Note that
delegated voting rights as of any point in time are counted as being held
by the delegate and not the delegator. “Persons” include entities as well as
individuals. We say i ∈ V if individual or entity i is on the list.
These persons vote on a dichotomous choice between policies A and B,
one of which is the correct collective choice under the determinate decision
assumption. Voter i has a probability pi of making the correct decision. We
say that this probability represents that person’s epistemic competence. Un-
der the cognizable probability assumption each voter i knows the probability
pi.
A person i may choose to vote only ¯ti ∈ [0, ti) of their voting rights.
In that case, we say that person i abstained from voting on ti − ¯ti of their
voting rights. Taking into account abstentions, we form ¯V , the vote profile
consisting of the same list of persons in V along with the actual number of
voting rights, ¯ti, that person i has exercised. We say i ∈ ¯V if ¯ti > 0 for
voter can make the best possible collective decision unilaterally, and, given the shared
epistemic objective, any vote will unanimously favor that decision.
8

---

## Page 11

person i. We do not distinguish between abstention by passivity, not voting
at all, and abstentions in which person i does vote but specifies “abstain” as
a ballot choice.
In most situations, we will assume that we are at the point of decision so
that voters cannot delegate their voting rights to others, no persons may be
added to the voter profile, no further deliberation will occur, and voters can-
not increase their probability of being correct by learning new information.
But we will consider approaches such as liquid democracy where further del-
egation is possible, and we will consider the impact of expanding the voter
profile by adding new voters or delegates.
2.2.2 Independent Competencies Test
The independent competencies test relies on the following assumption:
Assumption 5A (Independent Competencies): Voter judgments are
statistically independent.
This assumption gives us a powerful tool to assess governance approaches.
As shown by Nitzan and Paroush (1982), if voters have independent compe-
tencies, then optimal voting weights are:
wi = ln
 pi
1 − pi

. (1)
Here “optimal” means creating the highest possible probability of a correct
collective decision. We refer to this optimality result as the Optimal Weight-
ing Theorem.
Let vi indicate person i’s vote where:
vi =



+1 if voter i votes for A
0 if voter i abstains
−1 if voter i votes for B
Then the collective decision, d, with the highest probability of being correct
is:
d =



A if sgn
PN
i=1 wivi

> 0
x ∈R {A, B} if PN
i=1 wivi = 0
B if sgn
PN
i=1 wivi

< 0
9

---

## Page 12

where ∈R indicates taking a random draw uniformly from a set. 5 A useful
property of the weights in this setting of independence that we are assuming
is that the weights depend only on each voter’s epistemic competence and
not on the characteristics of any other voter.
To explore the meaning of the weights, consider the following table. The
first column contains various weights, and the second column indicates the
probabilities corresponding to the weights. In a situation of ignorance, a
voter can do no better than a coin flip in deciding between A and B. The
probability of being correct is 0 .5, and the optimal weight is zero. 6
Table 1: Weights for Probabilities
weight probability 3 voters 5 voters 7 voters
-2 0.1192 0.0392 0.0141 0.0052
-1 0.2689 0.1781 0.1245 0.0894
-0.1 0.4750 0.4626 0.4532 0.4455
0 0.5000 0.5000 0.5000 0.5000
0.1 0.5250 0.5374 0.5468 0.5545
1 0.7311 0.8219 0.8755 0.9106
2 0.8808 0.9608 0.9859 0.9948
4 0.9820 0.9990 0.9999 1.0000
5 0.9933 0.9999 1.0000 1.0000
10 1.0000 1.0000 1.0000 1.0000
If the voter is more likely to be wrong than correct, the voter’s weight is
negative. In that case, the voter’s choices still contain valuable information.
The negative sign simply shifts the valence of the choices in the tabulation.
Examination of the table reveals that probabilities equally above and below
0.5 result in weights with the same absolute value, but opposite signs. The
corresponding votes contain equally useful information.
The final three columns in the table state the probabilities of a correct
collective decision with majority voting for 3, 5, and 7 voters with indepen-
dent competencies, all with the same epistemic competence indicated in the
5In other words, we resolve a tie vote through a coin flip.
6The same probability and weight apply if the voter is informed but ends up being
equally balanced between A and B.
10

---

## Page 13

second column. These columns demonstrate the increasing reliability, or in
the case of probabilities below 0.5, the decreasing reliability, that results from
increasing the number of voters, as in Condorcet’s Jury Theorem.
2.2.3 Dependent Competencies Test
Assuming independent competencies simplifies the analysis because it allows
us to apply the Optimal Weighting Theorem directly. But independence of
competencies is a very strong assumption. We would expect voters to share
some information sources, creating dependencies in competencies. In this
subsection, we drop Assumption 5A of independent competencies in favor of
a less restrictive alternative:
Assumption 5B (Dependent Competencies): Voter judgments may
be statistically dependent.
Dependent competencies can greatly affect the analysis as indicated by
the following example:
Example 2.1. There are 3000 voters with weight wi = 0.1 (pi ≈ 0.525),
and one voter with weight wi = 1 ( p ≈ 0.731). Weighted voting using
decision rule d determines the collective decision. Assuming independent
competencies for the 3000 voters, the probability that the collective decision
will be correct is approximately 0 .997 if only those voters participate, Con-
dorcet’s Jury Theorem in action. Adding an independently competent voter
with weight 1 increases this probability by only .000028, leaving 0.997 as the
rounded result. 7 Suppose, however, that the judgments of the 3000 voters
are perfectly correlated. This dependence might result from relying on a sin-
gle source, such as consulting a single prominent internet or Discord post in
the absence of having any expertise. Now the 3000 voters are equivalent to
a single voter in value added and deserve a cumulative weight of only 0 .1.
The more competent voter has ten times this weight and will unilaterally
7Under weighted voting, with probability 0 .731 the more competent voter will correct
results in which between 1490 and 1500 of the other voters choose the right alternative
but with probability 0 .269 the more competent voter will reverse a correct collective out-
come when between 1500 and 1510 of the other voters choose the right alternative. The
calculation of these ranges and effects follows from application of the cumulative binomial
distribution.
11

---

## Page 14

determine the outcome under decision rule d. The probability of a correct
collective outcome plunges from 0 .997 to 0.731, the epistemic competence of
the more competent voter acting alone. If we fail to allow for dependencies by
continuing to weight the set of less competent voters as if they had indepen-
dent competencies, the outcome is even worse. We will incorrectly weight the
3000 voters three hundred times more than the single more competent voter.
Because the 3000 voters act as if they were a single voter due to the per-
fect correlation, the probability of making a correct collective choice plunges
even further to 0.525. This effect of failing to adjust the weights to take into
account dependencies can occur with as little as eleven less competent but
perfectly correlated voters combined with the single more competent voter.□
The example not only indicates the need to adjust the weighting method
to allow for dependencies, but also is suggestive of how to do so. With inde-
pendent competencies, each vote is an independent signal of which collective
alternative is the correct one. The Optimal Weighting Theorem tells us how
to weight the various signals based on each signal’s probability of indicating
the correct collective outcome by itself. In Example 2.1 under the depen-
dence assumption, there are in effect only two signals, one that should be
weighted 1 and the other 0 .1. One way to reach that result would be to
create adjusted weights by dividing the optimal weights of each of the 3000
perfectly correlated voters that would obtain under independent competen-
cies by 3000. We state this idea, which follows directly from the Optimal
Weighting Theorem by simply considering voters to be information signals
in that Theorem, formally:
Proposition 2.2. Given Assumption 4 (Information Decomposition),
the following method will maximize the probability of making a correct collec-
tive decision:
(i) For each information item i on the canonical list of independent and ex-
haustive items, compute the probability, pi, that the correct collective decision
will follow solely from the information from that item.
12

---

## Page 15

(ii) Compute a weight, wi, for each such item in the same manner as under
the Optimal Weighting Theorem, that is:
wi = ln
 pi
1 − pi

.
(iii) For each information item, determine which collective decision the infor-
mation for that item indicates is the correct one, tabulating these indications
as “votes” for one alternative or the other.
(iv) Combine the weighted votes to arrive at collective decision d in the man-
ner indicated by the Optimal Weighting Theorem.
We have an approach for both the case of independent competencies and
the case of dependent competencies of maximizing the probability of mak-
ing the correct collective decision. A social planner who had all the relevant
information about voters or signals could apply those approaches directly.
But in the context of DAO governance, we face a very different problem.
Voters are attempting to arrive at the correct collective decision in a decen-
tralized way. The rest of the paper concerns the ability of various governance
methods that are or have been considered to be strong candidates for gov-
erning DAOs to actualize this goal. We have created two epistemic tests for
those methods, one for independent voter competencies and one for the case
where those competencies are statistically dependent. The dependent case
is much more challenging because of the need to decompose information sets
into independent components.8
8The limitation to “candidate” governance methods is analytically significant. Assump-
tions 2-4 allow us to reach interesting conclusions about these methods, the point of the
paper, but the assumptions are so strong that it is possible to create simple decentralized
mechanisms that would replicate the performance of a social planner with complete in-
formation about voters or signals. For instance, we could create code that implemented
decision rule d, and then embed that code in a smart contract. Participating voters would
report their independent competencies or their signals and the competency associated with
each signal to the smart contract along with the vote associated with each element. The
smart contract would use the competencies and the set of voter or signal votes to com-
pute the outcome. By Assumption 2, voters would be motivated to report and to report
honestly. Assumptions 3 and 4 guarantee voter knowledge of all the relevant competencies
and that there is a canonical list of signals that can for the basis of a decision.
13

---

## Page 16

In the next three sections, we discuss abstention, participation, and del-
egation in that order, an order which allows us to create a sequence of dis-
cussions that build upon each other. Throughout, as a default, we assume
that voters have flexibility with respect to abstaining, voting, and delegating:
Assumption 6 (Voter Flexibility): Voters may choose to vote or ab-
stain on any portion of their voting rights. If explicit delegation of voting
rights to others is permitted, voters may delegate any portion of such voting
rights in any mixture to as many delegates as desired.
Thus, we do not limit voters by an all-or-none choice between abstaining,
voting, and explicit delegation of token rights to others. Voters can choose
any mixture. In addition, if explicit delegation is permitted, voters are not
limited to delegating to only one delegate but can choose any combination
of delegates and amounts allocated to each delegate.
Much of the literature considers methods that are not consistent with
this assumption, and, at some points in the paper, we examine the exclusive
use of one method. We note when that is the case, but, otherwise, we allow
ourselves the liberty of the assumption.
In all three sections we impose decentralization as a constraint. The au-
tonomous actions of the voters solely determine the outcome. Our approach
is to apply the two epistemic tests, mining the results for more general in-
sights. Before proceeding, we clarify our terminology.
2.3 Coherent Terminology
As mentioned in the introduction, one idea is to advocate for more intensive
use of “delegation” to promote “participation.” This idea is curious in light
of the fact that abstention itself is a form of delegation. By abstaining,
one delegates the decision to the remaining voters in whatever voting power
configuration exists.9 Abstention is not an alternative to delegation but just
selection of a different set of delegates. It also is functionally equivalent
9Feddersen and Pesendorfer (1996) point out this equivalence in a paper that shows that
abstention can be an optimal method of delegation when the other voters have superior
information. It is likely that others noted the equivalence prior to 1996, perhaps all the
way back into antiquity, but the author has not attempted to track down earlier instances.
Current scholars are aware of the equivalence. See, e.g., Mooers et al. (2024) who compare
liquid delegation to majority voting and to majority voting with the option to abstain.
14

---

## Page 17

because the same effect as abstaining can be created by a particular pattern
of formal delegation of one’s voting rights to others. Exercising one’s voting
rights directly can be considered a form of delegation, namely self-delegation.
It is functionally equivalent delegating to a slate that includes oneself with
an allocation of zero to all the other delegates. It seems that every action
and inaction can be considered to be “delegation.”
“Participation” suffers from its own considerable ambiguities. It can mean
delegating voting rights to others or voting oneself. It also is not clear why it
should not also encompass abstention, especially deliberate and considered
abstention of the kind discussed in Feddersen and Pesendorfer (1996) that
may increase the probability of a correct collective decision. Even abstention
based on rational passivity arguably is “participation.” It may be that every
action and inaction is “participation” as well as “delegation.”
In the face of these ambiguities, what terminology shall we use? Two
elements are important: the mechanism that embodies the choice process,
and epistemic distinctions. Classic delegation involves the explicit trans-
fer of voting rights to others, which we call “transfer delegation.” At the
epistemic level unless a transfer exactly replicates the existing voting rights
proportions held by the other voters, the transfer will shift the relative voting
rights among these voters, an “external relative weight intervention.” Know-
ing whether a particular external relative weight intervention will improve
the quality of the collective choice process requires the delegator to know
something about the characteristics of the other voters, for instance, their
optimal voting weights. In section 5, we describe this knowledge as an as-
pect of delegative competence as distinguished from epistemic competence,
the probability that the voter acting alone will reach the correct collective
decision.
The situation is very different with respect to a voter abstaining or ex-
ercising voting rights directly by voting. These actions do not affect the
relative weights of the other parties. But exercising voting rights directly in-
creases the relative weight of the voter compared to all other voters, which
can be thought of as “voter relative weight assertion.”
Now we specify terminology conventions for the rest of the paper. The
next section examines partial abstention. Voteri has ti voting rights, abstains
on ai of those rights, and exercises ¯ti = ti − ai of the voting rights directly
by voting where ¯ti ∈ [0, ti]. As we have seen, this can be considered a kind of
delegation, and we title the next section “Delegation by Partial Abstention.”
Whenever we use the term “partial abstention,” the delegative aspect is
15

---

## Page 18

implicit, and voter relative weight assertion occurs to the extent voting rights
are exercised directly.
We use the term “direct participation” to describe exercising voting rights
directly by voting. Direct participation is the subject of section 4. Other
types of participation such as transfer delegation or deliberate and considered
abstention are therefore instances of “indirect participation.”
In section 5 we study transfer delegation. Although it is possible to create
a set of transfers that leaves the relative weights of other voters undisturbed,
the focus in section 5 is the more general situation in which transfers shift
those relative weights. In that general situation, transfer delegation includes
an element of external relative weight intervention.
3 Delegation by Partial Abstention
As discussed in the previous subsection, abstention is equivalent to an actual
delegation of one’s voting rights proportionally to all other voters. We em-
body this result in a more general form that includes partial abstention as a
possibility for all voters:
Observation 3.1. For voter i, abstaining from voting a number of voting
rights, ai, is equivalent to delegating votes from the same number of voting
rights proportionally to all voters, including voter i, based on the voting rights
holdings that they will exercise in the actual vote.
This observation follows from the fact that both abstention and the equiv-
alent delegation leave all voters with the same proportion of the total number
of voting rights that are actually voted.
The optimal weights under the Optimal Weighting Theorem, which re-
quires the assumption of independent competencies, are attainable by partial
abstention:
Proposition 3.2. Assume that voter competencies are independent and
that there is at least one j such that pj > 0.5. Define:
R = sup
i
wi
ti
where wi is the optimal weight for voter i as defined in equation (1) and i
holds ti total voting rights. Suppose that each voter abstains from voting on
16

---

## Page 19

ai ≤ ti of such voting rights, using only t∗
i = ti − ai to vote, and that each
voter chooses ai such that:
wi
t∗
i
= wi
ti − ai
= R
Then the probability of a correct collective decision under decision rule d is
maximized.
Proof. Note that by Assumption 3, we effectively have pi ≥ 0.5 for all i,
ruling out negative weights. Define W =PN
i=1 wi. W > 0 because wi ≥ 0 ∀ i
and wj > 0 for at least one j. Define K = 1
W . Define w∗
i as the effective
weights in the actual vote. Then:
w∗
i ≡ t∗
iPN
i=1 t∗
i
=
wi
RPN
i=1
wi
R
= Kw i
where K = 1
W is a constant. The effective weights w∗
i are proportional to the
optimal weights wi, resulting in identical collective voting outcomes. □
Intuitively, if voters abstain such that all voters’ ratios of their optimal
weights to the number of voting rights they will exercise are the same, then
the ratio of the voting rights exercised by each voter compared to the to-
tal voting rights exercised by all voters will be proportional to the optimal
weight for that voter, resulting in the same collective decision as employing
the optimal weights directly.
Given independent competencies, cognizable probabilities, and the shared
epistemic objective, voters can arrive at an collective decision in accord with
the Optimal Weighting Theorem with no need for coordination other than
knowledge of R:
Corollary 3.3. Under the assumptions of Proposition 3.2, if each voter
shares the epistemic objective (Assumption 2), knows R, and knows pi, their
own competency (Assumption 3), then the best possible collective decision is
attainable without further coordination.
Proof. Knowing pi enables voter i to compute wi, the optimal weight
for that voter. Acting in accord with the epistemic objective, each voter will
exercise only t∗
i = wi
R out of the total voting rights, ti ≥ t∗
i , that the voter
17

---

## Page 20

could exercise. Then by Proposition 3.2 the probability of a correct collec-
tive decision is maximized. □
The assumption that each voter knows R is implausible. That would re-
quire knowing the full panel of voting rights, ( t1, t2, ..., tN) and the full panel
of competencies, ( w1, w2, ..., wN). Fortunately, the next Corollary suggests a
way to largely or entirely circumvent this problem. The voters can coordinate
on any value ˜R ≥ R, and, without affecting the efficacy of the mechanism,
we can allocate initial votes in any way desired:
Corollary 3.4. The operation of Proposition 3.2 and the result in Corol-
lary 3.3 are unaffected by either or both of the following modifications:
(i) Reallocating the panel of voting rights from ( t1, t2, ..., tN) to a new
panel, ( ˜t1, ˜t2, ..., ˜tN), subject to ˜ti > 0 for all i such that ti > 0, resetting R
to R = supi
wi
˜ti
accordingly.
(ii) Voters coordinate on a value ˜R ≥ R rather than R.
Proof. Proposition 3.2 applies for any panel of voting rights with en-
tirely positive values if the value of R is calculated based on the voting right
levels in that panel. The proof of Proposition 3.2 is unaffected by shift-
ing R to ˜R so long as ˜R ≥ R. If ˜R < R then it will not be the case that
t∗
i = wi
˜R for the voter with the highest wi
t∗
i
ratio and possibly for other voters.□
This Corollary suggests an approach to address the unrealistic assumption
that all voters knowR. Rather than coordinating on R, voters can coordinate
on a large number, ˜R, that is likely to be greater than R. Furthermore, by
reallocating all the voting rights equally among all voters, the possibility that
R itself might be very large due to the most competent voter having relatively
few voting rights is eliminated. There is no requirement that PN
i=1 ˜ti =PN
i=1 ti.
The primary problem that arises from setting ˜R too small is that highly
competent voters or signals will not be able to exercise enough voting rights.
The next example indicates, however, that it is easy to pick a large enough
˜R so that the danger of derailing effective collective choice is minimal even
if ˜R < R , violating condition (i) in Corollary 3.4. Prior to the example we
18

---

## Page 21

state and prove a Lemma and a Corollary of the Lemma that are necessary
for easy and clear exposition of the example.
Define N−i = (1, 2, 3, ..., i − 1, i + 1, i + 2, ...n), a subset of N, and define
S∗
−i = min
A⊆N−i,B=N−i/A

X
j∈A
tj −
X
j∈B
tj
, where tj is the voting weight for voter
j. Note that the weights defining the voting rule in this case need not be
optimal. S∗
−i is the smallest gap between the sum of the weights for a win-
ning and a losing coalition attainable when all voters except voter i arrange
themselves on opposing sides of a binary choice. Voter i is minimally deci-
sive if |ti| > S ∗
−i. If voter i is not minimally decisive, then there will be no
configuration of voters for which voter i alone will be decisive. 10
Lemma 3.5. If voter competencies are independent and voter i is min-
imally decisive, then an increase (decrease) in the epistemic competence, pi,
of that voter, will increase the probability of making a correct collective de-
cision under voting with fixed weights when the voter’s weight, ti, is strictly
positive (strictly negative).
Proof. Define a set of winning coalitions for a voting rule with fixed vot-
ing weights for each voter: W =

S ⊆ N |P
i∈S ti > 0.5P
i∈N ti
	
. Assume
that there are no subsets for which P
i∈S ti = 0.5P
i∈N ti, a reasonable as-
sumption in sufficiently rich environments in which such subsets would be a
set of measure zero. The probability, P , of a correct collective choice under
the weighted voting rule is:
P =
X
S∈W
Y
j∈S
pj
Y
k /∈S
(1 − pk). (2)
The partial derivative, ∂P
∂pi
will produce a term for every term in the sum for
P because each voter i is either in S or its complement. Suppose first that
10More than one voter may fail to be minimally decisive. For example, suppose that
there are three voters with weights 3 each and that there are a large number of other voters
whose weights, all positive, total 1. Then none of these other voters is minimally decisive,
and, indeed the collective mass of these other voters is not itself minimally decisive. Only
the three high weighted voters matter with respect to the collective choice. This analysis
and the definition and role of S∗
−i derive from Nitzan and Paroush (1982, Corollary 1).
19

---

## Page 22

ti > 0. When the voter is in the complement of S, differentiation will result
in a term, T , that, without loss of generality, looks like:
T = −
Y
j∈S
pj
Y
k /∈S,k̸=i
(1 − pj).
However, if S is a winning coalition and ti > 0, then S+i ≡ S + {i} also is a
winning coalition. The corresponding term in P is:
Y
j∈S+i
pj
Y
k /∈S+i
(1 − pk) = (−T )pi.
whose partial derivative with respect to pi is −T . Thus, for each term in the
partial derivative ∂P
∂pi
that is negative, there is an offsetting positive term.
However, if voter i is minimally decisive, there will be at least one positive
term in the partial derivative that is not matched by a negative term. To see
that, note that if voter i is minimally decisive and ti > 0, then there exists
at least one winning coalition, ¯S with i ∈ ¯S, such that ¯S − {i} is not a win-
ning coalition. The positive term in the partial derivative that results from
differentiating the term in P for ¯S will have no corresponding negative term
because ¯S − {i} is not a winning coalition.
The proof for the case ti < 0 is similar in an obvious way. One starts with
voter i in a winning coalition, takes the partial derivative, shows that the re-
sulting positive term is matched with a negative term of the same magnitude
that occurs when i is added to the losing coalition before differentiation. Be-
cause ti < 0, the losing coalition remains a losing coalition. Then one shows
that if voter i is minimally decisive, there will be negative terms in the par-
tial derivative ∂P
∂pi
not matched by positive terms. □.
Corollary 3.6. If voter competencies are independent and voter i is not
minimally decisive, then changes in that voter’s epistemic competence, pi,
will have no impact on the probability of making a correct collective decision
under voting with fixed weights.
Proof. If voter i is not minimally decisive, then every winning coali-
tion that contains i is matched in a one-to-one correspondence to a winning
coalition that excludes i. Each such pair will result in terms in the partial
20

---

## Page 23

derivative, ∂P
∂pi
, that are equal in magnitude but of opposite signs. This re-
sult is obvious. If a voter never affects the outcome, it does not matter how
competent they are. □
Now the example.
Example 3.7. Suppose N = 100, that is, there are 100 voters who hold
voting rights. Reallocate the number of voting rights for each voter i to
˜ti = 1. Now R = sup i wi, the largest optimal voting weight across all vot-
ers, and because the number of voters is finite, there will be a voter m such
that R = wm. Assume voters do not know the value of R. Set ˜R = 1000,
and assume all voters know ˜R and use it to coordinate their abstentions.
If wm ≤ 1000, then ˜R ≥ R and Corollary 3.4 implies that the voting rule
remains optimal. If wm > 1000, then ˜R < R and voters will partially ab-
stain in a way that assigns an effective weight of 1000 to voter m, which is
less than the optimal weight for voter m. By Lemma 3.5 and Corollary 3.6,
the probability of a correct collective choice in this situation will be a least
as large as the reference situation in which voter m actually had an opti-
mal weight equal to ˜R, and in which no other voter had a greater optimal
weight.11 In the reference situation, the probability of a correct collective de-
cision is at least pm. If wm >P
i∈S,i̸=m wi, voter m will dictate the result,
and the probability of a correct collective choice will be exactly pm. If, in-
stead, wm <P
i∈S,i̸=m wi, the probability of a correct collective choice will
be greater than pm. But pm for wm = 1000 is very high. 1 − pm ≈ 5 × 10−435.
If we had chosen ˜R = 20, a much smaller number, the probability of an in-
correct collective choice would be no greater than 2 .1 × 10−9, about two out
of a billion.
It is clear that for any ϵ > 0, no matter how small, we can pick an ˜R
sufficiently large that 1 − pm ≤ ϵ. In the case of R > ˜R, the probability of
making a correct collective choice will be in the interval [1 − ϵ, 1] and we will
11If voter m is minimally decisive, then Lemma 3.5 applies, and the probability of a
correct collective choice will be higher than in the reference situation. If voter m is not
minimally decisive, then Corollary 3.6 applies, and the probability of a correct collective
choice will be the same as in the reference situation. There are voter profiles in which
voter m would not be minimally decisive. For example, if there are an even number of
voters all with epistemic competence pm, then there is no case except for ties in which
voter m can change the outcome. |wm| = S∗
−i rather than |wi| > S ∗
−i , which is required
by the definition of minimally decisive.
21

---

## Page 24

fall short of maximizing that probability by at most ϵ. Because we do not
fall short at all when R ≤ ˜R we are within ϵ of the maximum in all cases.
We conclude that we can approximate attainment of the maximum proba-
bility of a correct collective decision to any precision desired. □
We now shift from the independent competencies case (Assumption 5A)
to the case in which there are dependencies (Assumption 5B). Based on
Assumptions 3 and 4, each voter can cognize their information as a set of in-
dependent signals that are elements of a canonical list that contains all such
signals across all voters. The coordination problem is evident from Example
2.1, which had 3000 voters with optimal weight wi = 0.1 and one voter with
optimal weight wi = 1. If the 3000 voters do not have independent compe-
tencies but, in fact, are perfectly correlated, then they should carry a single
weight of 0 .1 rather than, collectively, 300, which would be appropriate in
the independence case. In order to correct for this difficulty, each of the 3000
voters needs to know that the signal implicit in their competency is shared
with 2999 other voters. If that is the case, these voters can simply abstain
on all but 1/3000 of each of their votes, with the result that collectively their
signal would receive the proper weight of 0 .1 versus the independent signal
received by the more competent voter.
This discussion suggests the following assumption as a vehicle for address-
ing the dependency case:
Assumption 7 (Cognizable Signal Numeracy): For each indepen-
dent signal that a voter receives, the voter knows how many other voters
received the same signal.
This assumption is both strong and qualitatively different than the assump-
tions we made in the independence case. In that case, each voter only had to
have knowledge of their own epistemic competence and the ability to coor-
dinate with other voters on a single large number as a basis for determining
the optimal degree of abstention. In the dependency case, voters must know
about other voters’ signals in order to achieve an optimal collective choice in
a decentralized manner.
Based on Assumption 3, a single governing party who received all of the
signals on the canonical list could use the Optimal Weighting Theorem to
reach the best possible collective result. Under Assumption 3, that party
could compute the probability of reaching the correct collective result based
22

---

## Page 25

on each signal by itself. Then the party could assign optimal weights to
each signal based on these probabilities, create a vote based on the signals
received, and maximize the probability of a correct collective decision.
The same outcome as this centralized approach can be achieved in a de-
centralized manner. Each voter does the same computation of probabilities
for the set of signals which that voter receives. The voter computes the ap-
propriate weights but then divides each weight by the number of voters who
receive that signal, a number known to each voter by Assumption 7. There
is an additional step. As in the independence case, each voter must abstain
on a proportion of that voter’s voting rights in order to take into account the
fact that the voter only receives a subset of the signals on the canonical list.
We complete the description and state the result as a Proposition:
Proposition 3.8. Assume cognizable probabilities, information decom-
position, and cognizable signal numeracy (Assumptions 3, 4, and 7). Assume
that voter competencies are dependent because voters each receive a set of in-
dependent signals, each of which may be received by some distinct subset of
other voters. Define C as the canonical set of all the independent signals
received by at least one voter. Define Cj ⊆ C to be the set of independent
signals received by voter j. Without loss of generality, assume that each voter
has one infinitely-divisible voting right on which the voter may partially ab-
stain to any degree. Suppose each voter j uses the following algorithm to
decide how to vote and what proportion of the unit voting right to exercise:
(i) Voter j observes Cj, the set of all independent signals received by that
voter, and computes based on each signal, i ∈ Cj, the probability, pi, of mak-
ing a correct collective choice based only on that signal.
(ii) Voter j computes an optimal weight, wi, for each signal i ∈ Cj and
then divides that weight by the total number of voters who receive that signal
to arrive at a final set of adjusted weights, {wa
i | i ∈ Cj}.
(iii) Voter j allocates its voting rights in proportion to the weights, with
each signal i ∈ Cj receiving an allocation of rij voting rights.
23

---

## Page 26

(iv) For each signal i ∈ Cj, voter j abstains on aij of the rij voting rights,
voting only r∗
ij = rij − aij voting rights, choosing aij such that:
wa
i
r∗
ij
= wa
i
rij − aij
= R = sup
i∈Cj , j ∈N
wa
i
rij
(v) Voter j exercises the voting rights accordingly, netting out offsetting
votes if different signals suggest a different choice between the two alterna-
tives.
If all voters follow this algorithm, then the probability of a correct collective
decision under decision rule d is maximized.
Proof. The proof is identical to the proof of Proposition 3.2 in the
independent case, substituting independent signals for independent voters,
and noting that signals received by more than one voter aggregate to the
equivalent of one signal with the correct weight. To see this aggregation
point, consider a signal i that is received by K voters. The number of voting
rights that each voter k commits to the signal is:
r∗
ik = wi
KR
noting that by Assumption 3, all voters compute the same value for the
optimal weight, wi, for any given signal i. The aggregate for signal i will be:
KX
k=1
r∗
ik = wi
R .
As a consequence, the weights for the signals using the algorithm will be pro-
portional to the optimal weights with the same proportionality constant, and
by the Optimal Weighting Theorem, the probability of making a correct col-
lective choice is maximized. □.
The result is the same as if a single governing party received all the in-
dependent signals and made the collective decision using optimal weights for
each signal. The coordination steps ( ii) - (iv) allow the voters to achieve the
same result in a decentralized setting. If R is not common knowledge, the
same approximation approach applicable in the case of independent compe-
tencies is available:
24

---

## Page 27

Corollary 3.9. If all the assumptions of Proposition 3.8 apply except that
R is not common knowledge among the voters, voters can achieve an approx-
imately optimal result of any degree of accuracy with respect to maximizing
the probability of a correct collective decision by coordinating on sufficiently
high substitute value, ˜R, rather than R in the manner described by Corollary
3.4 and Example 3.7.
Proof. The Corollary follows immediately from Proposition 3.8, Corol-
lary 3.4, and the reasoning in Example 3.7. □.
4 Direct Participation
As discussed in the Introduction, low participation rates have been a major
concern for DAOs. “Democratic” ideals and the desire to avoid de facto
centralized control both create an impetus to increase direct participation.
From an epistemic standpoint, however, the desirability of increasing direct
participation is much more nuanced, and it depends heavily on the details of
the composition of voting rights across voters. In this subsection, we explore
the nuances.
There is an extensive literature relevant to the epistemic consequences
of direct participation, particularly in the context of one-person-one-vote
systems. We do not attempt to discuss that literature or its implications
comprehensively, but instead focus on some basic results and examples that
illustrate major contours of the epistemic implications of direct participation
as well as aspects that are particularly pertinent to the discussion of transfer
delegation in the next section.
We follow Ben-Yashar and Paroush (2000) by defining the voting group’s
competence structure as p = ( p1, p2, ..., pN) where we order the voters such
that pi ≥ pj for i > j . We also define the corresponding optimal weight
structure as w = ( w1, w2, ..., wN) and the voting rights structure as v =
(v1, v2, ..., vN), which expresses the actual weights under the voting rule nor-
malized such that
NX
i=1
vi =
NX
i=1
wi = W.
25

---

## Page 28

I.e., if each voter i has ti > 0 voting rights, then we set:
vi = ti
PN
j=1 tj
W.
Given this normalization, the voting rule is the one specified by the Optimal
Weighting Theorem if and only if v = w. One-person-one-vote corresponds
to vi = 1 /W ∀ i, which we denote as the voting rights structure v1P 1V .
Note that as in the previous sections, voters may be delegates with voting
rights acquired by transfer delegation. Consequently, the results in this sec-
tion speak directly to the methods of transfer delegation discussed in the
subsequent section.
We begin on a positive note, delineating an environment in which in-
creased direct participation is never harmful and often quite valuable with
respect to making the correct collective decision:
Proposition 4.1. In the independence case, if both present and potential
voters exercise their voting rights using the weights specified by the Opti-
mal Weighting Theorem, then adding a new voter, j, with pj ≥ 0.5 weakly
increases the probability of making the correct collective choice, with the in-
crease being strictly positive if and only if the new voter is minimally decisive
after being added.
Voters with pj = 0.5 are never minimally decisive. Adding them neither
increases nor decreases the probability of making a correct collective decision.
The same is true for voters withpj > 0.5 who are not minimally decisive after
being added.
Before executing the proof of Proposition 4.1, we state a Lemma that is
useful in that proof as well as later proofs in the paper.
Lemma 4.2 (Nitzan and Paroush (1982)). In the independence case
in which voter i has optimal weight wi, consider two complementary coalitions
of voters: S ⊆ N and S/N. Then:
Y
j∈S
pj
Y
k∈N/S
(1 − pk) ⋚
Y
k∈N/S
pk
Y
j∈S
(1 − pj)
is equivalent to X
j∈S
wj ⋚
X
k∈N/S
wk.
26

---

## Page 29

Proof. This result is part of the proof of the Optimal Weighting Theorem
in Nitzan and Paroush (1982, Theorem 1, p. 293).
Y
j∈S
pj
Y
k∈N/S
(1 − pk) ⋚
Y
k∈N/S
pk
Y
j∈S
(1 − pj)
is equivalent to: Y
j∈S
pj
Y
j∈S
(1 − pj)
⋚
Y
k∈N/S
pk
Y
k∈N/S
(1 − pk)
which reduces to: Y
j∈S
pj
(1 − pj) ⋚
Y
k∈N/S
pk
(1 − pk)
which is equivalent to: X
j∈S
wj ⋚
X
k∈N/S
wk.
□
This Lemma is the core element of the proof of the Optimal Weighting
Theorem in Nitzan and Paroush (1982). Because it adds insight for what
follows, we explain why in the rest of this paragraph. A voting rule is com-
pletely determined by specifying which subset in each pair of complementary
subsets ( S ⊆ N, N/S) is a winning coalition. All subsets are a member of
one and only one such pair. For each subset S, define a pattern probability,
q(S):
q(S) =
Y
j∈S
pj
Y
k∈N/S
(1 − pk).
q(S) is the probability that all members of S vote for the correct alternative
while all members of N/S vote for the incorrect alternative. The left-hand
side of the first inequality in the Lemma is q(S), and the right-hand side
is q(N/S). Because any pattern can occur, P
S⊆W q(S) = 1 . Furthermore,
the probability of making a correct collective decision under a particular vot-
ing rule is the sum of the pattern probabilities associated with each winning
27

---

## Page 30

coalition under that rule as indicated by equation (2) in the proof of Lemma
3.5. It is obvious that the best possible voting rule will be the one which
chooses the winning coalition from each pair of complementary coalitions
that has the highest pattern probability. Lemma 4.2 indicates that a vot-
ing rule based on choosing the subset in each pair ( S ⊆ N, N/S) with the
highest sum of optimal voting weights under the Optimal Weighting Theo-
rem accomplishes exactly that result.
Proof of Proposition 4.1. Suppose there are K voters in the DAO,
all exercising their voting rights for each vote using optimal weights, wi, for
each voter i based on the Optimal Weighting Theorem. Add a new voter
j for whom pj ≥ 0.5 and thus wj ≥ 0 for the vote under consideration.
Consider two approaches. First, the new voter is a assigned a zero weight,
which is equivalent to precluding that voter from participating because with
zero weight they can have no impact on the outcome. Alternatively, the
new voter is assigned the optimal weight, wj, for that vote. It follows from
the Optimal Weighting Theorem that the second approach does not decrease
the probability of making the correct collective choice and may increase it
if wj > 0. I.e., adding voter j weakly increases the probability of making a
correct collective decision.
Claim: the probability of making a correct collective decision increases
if and only if the added voter, j, is minimally decisive after being added.
Consider the structure before adding j. This structure consists of a set W of
winning coalitions, and for each winning coalition S ⊆ N, the complement of
S in N, N/S, is a losing coalition. All coalitions belong to one and only one
such pair. Because the decision rule weights voters using optimal weights, if
S is a winning coalition, then P
i∈S wi >P
i∈N/S wi. The probability, P of a
correct collective choice is:
P =
X
S∈W
Y
i∈S
pi
Y
i /∈S
(1 − pi)
where each term is the probability of every member of a particular winning
coalition voting for the correct choice and every member of the complemen-
tary losing coalition voting for the inferior alternative.
For each pair consisting of a winning coalition,SW , and a losing coalition,
SL = N/SW , prior to adding voter j, define the following:
B =
Y
i∈SW
pi
Y
i∈SL
(1 − pi).
28

---

## Page 31

C =
Y
i∈SL
pi
Y
i∈SW
(1 − pi).
X = pjB = pj
Y
i∈SW
pi
Y
i∈SL
(1 − pi).
Y = (1 − pj)B = (1 − pj)
Y
i∈SW
pi
Y
i∈SL
(1 − pi).
Z = pjC = pj
Y
i∈SL
pi
Y
i∈SW
(1 − pi).
B is the term in P corresponding to SW being a winning coalition before
adding voter j, the baseline case. If voter j is not minimally decisive, then
both SW + {j} and SW are winning coalitions after adding j. As a result, af-
ter adding j, the terms X and Y now both appear in the sum for P instead
of B. But these terms add up to B. As a result, P does not change. Suppose
instead that j is minimally decisive. Then there is at least one coalition pair
consisting of some SW , a winning coalition, and SL = N/SW , the comple-
mentary losing coalition, for which adding voter j to SL transforms it into a
winning coalition. In this case, after adding j, both SW + {j} and SL + {j}
are winning coalitions, and the terms X and Z replace B in the sum com-
prising P .
It remains to prove that X + Z = pj(B + C) > B . This statement is
equivalent to pjC > (1 − pj)B, which reduces to: Z > Y . By Lemma 4.2,
Z > Y if and only if: X
i∈{SL+{j}}
wi >
X
i∈SW
wi.
This inequality is true because SL + {j} is a winning coalition and there-
fore must have a higher sum of optimal weights compared to its complement,
SW . Considering all “original” pairs of winning and complementary losing
coalitions before adding voter j, P will increase with respect to every origi-
nal pair for which voter j can shift the losing coalition to a winning coalition
by joining it, and P will remain unchanged with respect to the other pairs.
If voter j is minimally decisive, there must be at least one original pair for
which j can join a losing coalition and transform it into a winning coalition.
□.
The same result applies in the dependence case under Assumption 4 if vot-
ers can coordinate to separate out the underlying independent signals and
29

---

## Page 32

collectively give them the proper weight, for example, using the method de-
lineated in Proposition 3.8:
Corollary 4.3. In the dependence case under Assumption 4, if both
present and potential voters can coordinate to give each independent signal j
the optimal collective weight wj based on the fact that use of that signal by
itself results in a pj probability of making the correct collective choice, then
a new voter will increase the probability of a correct collective choice if and
only if the new voter observes one or more independent signals not observed
by any of the existing voters and these signals are collectively minimally de-
cisive after being added to the previous set of independent signals. If the new
voter does not observe such a set of signals, then adding the new voter will
have no impact on the collective choice.
The proof is identical to the proof of Proposition 4.1 substituting indepen-
dent signals for voters with independent epistemic competencies. In the rest
of this section, we will state many of the results in the context of the indepen-
dent competencies case with the understanding that the same results hold if
Assumption 4 applies and there is a coordination technology to extract and
properly weight independent signals so that they play the same role as in-
dependent voters. At some points, however, we will explicitly address the
dependencies case.
Define the following:
Optimal Epistemic Environment : An optimal epistemic environment
exists if the voting rule and voter coordination result in the optimal voting
weights according to the Optimal Weighting Theorem for either voters with
independent competencies or in the dependence case under Assumption 4 for
the canonical list of independent signals.
Proposition 4.1 and Corollary 4.3 indicate that in the optimal epistemic
environment, direct participation by new voters who bring new information
to the governance mechanism weakly increases the probability of making cor-
rect collective decisions and causes no harm when new voters arrive who do
not. Outside this environment, the epistemic impact of increased direct par-
ticipation becomes very uncertain and can be extremely negative. Although
the possibility of negative epistemic results is more general, we identify three
30

---

## Page 33

specific dangers that have high practical relevance and also play a major role
in the subsequent section that discusses transfer delegation.
A large number of scholars have examined one-person-one-vote majority
voting from an epistemic viewpoint. When voters have independent compe-
tencies, this voting system only satisfies the Optimal Weighting Theorem if
all voters have the same epistemic competence, pi = p ∀ i. In that case, con-
sonant with the increasing reliability property of Condorcet’s Jury Theorem,
adding new independent voters with the same level of competence increases
the probability of making the correct collective choice.
When independent voters have heterogeneous competencies, the situation
is quite different. It is no longer the case that v1P 1V = w. Guaranteeing
that adding independent voters with pi > 1/2 appears to require that the
added voters have very high epistemic competence compared to the existing
voters. Ben-Yashar and Nitzan (2017) examine majority voting (one-person-
one vote) when there are an odd number of voters. They show that a sufficient
condition for adding two new independent voters, i and j, to increase the
probability of a correct collective decision is wi + wj > w 1. The sum of the
optimal weights for the two added voters must exceed the optimal weight of
the most competent voter in the previous set.
Extending the analysis in Ben-Yashar and Nitzan (2017), we obtain the
following Corollary:
Corollary 4.4. Assume majority rule with a set of voters N where n =
|N | is odd and pi ≥ 0.5 ∀ i. Let S denote a subset of N and Nx the set of
all subsets of N of size x. Define:
A =
X
S⊆N n−1
2
Y
k∈S
pk
Y
k∈N \S
(1 − pk)
B =
X
S⊆N n+1
2
Y
k∈S
pk
Y
k∈N \S
(1 − pk)
ϕ = B
A .
Then ϕ ≥ 1 with equality only in the case pk = 0.5 ∀ k. Consider adding two
new voters with competencies pi and pj. Then:
31

---

## Page 34

(i) The probability of making a correct collective choice increases (decreases)
if and only if wi + wj > (<) ln(ϕ).
(ii) If pi = pj = 0 .5, then adding these voters will decrease the probabil-
ity of making a correct collective choice unless that probability is 0.5 because
pk = 0.5 ∀ k ∈ N.
(iii) If at least one voter k ∈ N has pk > 0.5 and the two new voters, i and
j, each have some epistemic competence, that is pi > 0.5 and pj > 0.5, then
there will be a range of values defined by wi + wj < ϕ for which adding these
two voters will decrease the probability of a correct collective choice.
(iv) For any ϵ > 0, it is possible to reduce the probability of a correct collec-
tive decision below 0.5 + ϵ by repeatedly adding new voters with pk > 0.5.
Proof. We have used an identical setup as Ben-Yashar and Nitzan (2017),
and A and B are exactly the same as stated in their paper. They show that
the change in the probability of a correct collective decision from adding two
new voters, i and j, to N is ∆ = pipjA − (1 − pi) (1 − pj) B where A is the
probability that exactly n−1
2 voters in the original set make the correct choice
and B is the probability that exactly n+1
2 of such voters make the correct
choice. A > 0 and B > 0.12 Given ϕ = B/A, straightforward arithmetic
establishes that the following three equations are equivalent:
∆ > (<) 0
pipj > (<) (1 − pi)(1 − pj) ϕ
wi + wj > (<) ln(ϕ)
It is easy to see that B ≥ A.
  n
n+1
2

=
  n
n−1
2

for n odd, and there is the fol-
lowing bijective correspondence between the terms of B and A: Choose a
subset S ⊆ N N+1
2
and some x ∈ S. Consider the term in B arising from S
12The ratio ϕ = B/A between them depends on the precise competence structure of
the original set of voters. Thus, the necessary and sufficient condition stated as (i) in
the Corollary is not general but depends on that structure. In contrast, the sufficient
condition in Ben-Yashar and Nitzan (2017) that wi + wj > w 1 implies a higher probability
of a correct collective decision is general, independent of the precise competence structure
in any given case.
32

---

## Page 35

and N/S:
Y
k∈S
pk
Y
k∈N/S
(1 − pk) = px
Y
k∈S/{x}
pk
Y
k∈N/S
(1 − pk) .
For each such term in B, there is a single corresponding term in A equal to:
Y
k∈S/x
pk
Y
k∈{N/S+{x}}
(1 − pk) = (1 − px)
Y
k∈S/{x}
pk
Y
k∈N/S
(1 − pk) .
Because pk ≥ 0.5 ∀ k, the term from B is greater than or equal to the term
from A with equality only when px = 0.5. The same is true for the exhaus-
tive set of all such pairs of terms from B and A. Thus, B ≥ A with equality
only when pk = 0.5 ∀ k ∈ N. (ii) and (iii) follow immediately from the sign
of ϕ under the respective assumptions about competence structure for those
two parts of the Corollary.
With respect to (iv), assume the opposite. That is, there is a level PL > 0.5
that is a lower bound for the probability of a correct collective decision that
is impervious to adding more voters with pi > 0.5. Because this lower bound
is greater than 0 .5, at the lower bound it must be the case that there is at
least one current voter k with pk > 0.5. Otherwise, P , the probability of
making a correct collective decision, would be 0 .5. But the presence of at
least one voter k with pk > 0.5 implies that ϕ > 1 and ln(ϕ) > 0. By (iii),
it is possible to pick two new voters i and j with pi > 0.5 and pj > 0.5 such
that P < P L, a contradiction. □.
Result (iv) in the Corollary exemplifies the first danger:
The Flooding Danger : Outside of the optimal epistemic environment,
there is the danger that adding voters with low levels of competence will sig-
nificantly lower the probability of making a correct collective decision even
if: (1) each of the added voters have independent competencies with respect
to each other and all existing voters; and (2) each added voterk has pk > 0.5.
In the optimal epistemic environment, the flooding danger is not present
because added voters receive optimal weights, which means appropriately
low ones for added voters with low competencies. Instead of potential detri-
ment, adding independent low competence voters each with pi > 0.5 weakly
increases the probability of making a correct collective choice. These added
33

---

## Page 36

voters are introducing fresh, valuable information which potentially enhances
the ability of the DAO to steer in the right direction.
The Flooding Danger comes strongly into play under policies that at-
tempt to enhance direct participation by drawing in voters who are either
“rationally ignorant” or “rationally ambivalent.” These voters have strong
reasons not become informed about the issues relevant to voting, and, conse-
quently, are likely to have low competence. Many of them may be “coin flip”
voters with pi = 0.5 and optimal weights wi = 0. In that case the Optimal
Weighting Theorem clearly indicates that the best strategy is not to vote,
a strategy that is equivalent to delegating their voting rights to the voters
who do participate (Observation 3.1 above). Efforts to induce such voters to
participate may have quite negative epistemic consequences. 13
There are many reasons to expect that a large proportion of token hold-
ers and even possibly a significant proportion of delegates will fall into the
rationally ignorant category with respect to many votes. Except for vot-
ers holding a significant portion of the economic (non-voting) rights inherent
in the total token supply, the benefits of any effort to become an informed
voter will accrue mostly to other token holders who are in effect free rid-
ers.14 Delegates may have very limited economic rights even though they
have substantial voting rights, making the question of how to motivate them
important. Regardless of the proportion of economic ownership, a voter who
holds a relatively modest share of the total voting rights will be very un-
likely to be decisive in any given vote, and voting is costly in terms of time
13Paroush (1997), who reaches conclusions related to part (iv) of Corollary 4.4, includes
the phrase “stay away from fair coins” in the title of his article and notes that “one cannot
even exclude the counter-intuitive case where all pi > 1/2 and yet lim π = 1 /2 when
the team size tends to infinity.” Stating this point more formally in a way that directly
follows from his analysis: Given any ϵ > 0, majority rule may result in a probability of
a correct collective choice less than 0.5 + ϵ despite having a countably infinite supply of
independent voters all of whom have pi > 0.5. He notes that for a collection of n voters
with w1 > Pn
i=0 wi, the Optimal Weighing Theorem implies that voter 1 making the
decision unilaterally (“expert rule”) is superior to majority rule. Nitzan and Paroush
(1982, Corollary 2(a)). It follows that majority rule among the remaining n − 1 voters
will result in a probability of a correct collective choice less than p1. Given an ϵ > 0, set
p = 0.5 + ϵ and a corresponding optimal weight, w = p
1−p. Construct a countably infinite
set of voters with an optimal weights given by wi = 1
2i w. Because P∞
i=1 wi = w, majority
rule will result in the probability of a correct collective choice less than p.
14Khanna (2022, pp. 239-240) describes this collective action problem in the corporate
setting with reference to some of the literature. Reyes et al. (2017, p. 26) appear to be
the first to note the presence and importance of the same problem in the DAO setting.
34

---

## Page 37

and other resources. Portfolio investors may hold a substantial proportion
of some voting rights. Many of these investors will hold a large number of
different tokens with each forming a relatively small portion of their portfo-
lios, a factor that favors rational ignorance with respect to any one token. In
addition, portfolio investors, especially if they engage in indexing strategies,
may tend to be rationally ambivalent. They may hold competing tokens so
that efforts on behalf of one token will create gains on that token that are
offset by losses on competing tokens also held in the portfolio. Broad index
holdings tend to cancel out idiosyncratic risks such as the competitive offsets
just described, leaving only coverage of economy-wide factors.
So far we have been looking at the case in which all voters are indepen-
dent. As mentioned the same analysis applies if we have properly unpacked
dependencies into independent signals, which then play the part of indepen-
dent voters in the analysis. A second danger arises when we fail to do so,
leaving dependencies in place with no adjustments and putting us outside of
the optimal epistemic environment which requires the unpacking.
The Dependency Danger : If we are not in the optimal epistemic environ-
ment because dependencies between voters are not taken into account, there
are plausible scenarios in which the probability of making a correct collective
decision will be substantially lower even if the voting method assigns opti-
mal weights to each voter i based on pi and all voters have pi > 0.5.
Example 2.1 is a clear and very relevant example of this danger. The ex-
ample includes 3000 voters with pi ≊ 0.525, each of whose votes are weighted
optimally at wi = 0.1 along with one “expert” voter, k, with wk = 1 based
on pk ≊ 0.731. The expert voter is independent of all the other voters. If
the 3000 voters are mutually independent, Condorcet’s Jury Theorem comes
into play, and the probability of a correct collective decision is approximately
0.997. But if the 3000 voters are perfectly correlated, then they all vote the
same way, and they are decisive based on the weighted voting rule with a
joint weight of 300 versus the expert with a weight of 1. The probability of
a correct collective decision collapses to approximately 0 .525, worse than ex-
pert rule, which would increase this probability to approximately 0 .731. If
the independent signals were unpacked appropriately, there would be two:
the expert’s vote signal with weight 1 and the single signal received by all
3000 voters with weight 0.1. The optimal epistemic environment that prop-
erly accounts for dependencies would be restored, and the result would be
35

---

## Page 38

the same as expert rule, appropriately in this situation. Instead the expert
gets washed out and the probability of making a correct collective decision
plunges by more than 20 percentage points.
This type of situation is plausible, especially if a system pressures large
sets of rationally uninformed voters into participating. Not wanting to de-
vote much time, which may be totally rational, a large group might, for
instance, go online and look at the first result that comes up on Google or
another widely-used resource. Then they all receive the same signal, result-
ing in perfect correlation among a large group of voters with potentially very
damaging epistemic consequences.
A third danger involves the opposite problem from too much influence
from a diffuse set of voters:
Epistemic Danger from Whales : Certain parties may hold a very large
portion of the total voting rights either stemming from their own token own-
ership or from delegation. In approaches such as one-token-one-vote that
do not employ optimal weights, these “token whales” or “delegate whales”
may have too much weight compared to the optimal level and may largely
determine decisions, resulting in a significant decrease in the probability of
making a correct collective decision. Other independent information will not
receive its due, and Condorcet’s Jury Theorem phenomena will be less able
to exert a positive influence.
In many instances, token whales or delegate whales may have high in-
dividual competence. In the case of token whales, having a large economic
stake creates a strong incentive to be well informed because the token whale
can capture a large percentage of the benefit from accumulating expertise.
Aside from being well informed, token whales in particular have a strong
incentive to use delegation, including abstention as a form of delegation, to
move effective voting weights toward the optimal set. And when the required
adjustment rests with a single sophisticated party, it is more likely to occur
and more likely to occur in the correct direction than when a large number
of small holders must act in a coordinated fashion.
Both the epistemic danger of whales and the possible solutions are illus-
trated by the following example of one large voting rights holder surrounded
36

---

## Page 39

by a large group of identical small voting rights holders: 15
Example 4.5. Assume the same framework as Example 2.1 and as-
sume independent competencies across all voters. There are 30 , 000 voting
rights outstanding. A diffuse mass of 3000 voters each with optimal weight
wi = 0.1 (pi ≊ 0.525) hold one voting right each, and the remaining “whale”
voter with optimal weight wi = 1 ( p ≊ 0.731) holds 27 , 000 voting rights,
90% of the total. Majority voting without abstention will result in the whale
voter dictating all decisions. Although the whale is much more competent
than each of the individuals in the diffuse mass, as Example 2.1 indicates, ag-
gregation of the independent views of the diffuse mass with the whale when
voters are given their optimal weights will raise the probability of a correct
collective decision from 73.1% to 99.7%. The whale can easily ensure this re-
sult by abstaining on all but 10 of the whale’s total holdings of 27, 000 voting
rights. Then all parties will have optimal voting weights. The weights total
301 = 1 + 0.1 × 3000, and each voter has a number of voting rights equal to
10 times that voter’s weight. Only about 10 .03% of the voting rights will be
exercised.□
The example illustrates some of the ambiguities in the concept of partici-
pation. In the example, optimal abstention results in the exercise of very few
of the total voting rights. Participation is low in that sense. But unless one
is willing to assert that intelligent partial abstention makes the large voting
rights holder a non-participant, the participation rate in terms of intelligent
engagement is 100%. More generally, 100% participation in that sense is re-
quired to maximize the probability of making a correct collective decision if
each voter has valuable information that is independent of all other voters’
information. It also may be the case in some situations, which may be quite
common, that what appears to be a low participation rate in terms of en-
15The example and its solution draws from Bar-Isaac and Shapiro (2020) who study the
situation of a group of independent voters consisting of a single large, highly-competent
voting rights holder surrounded by a large number of smaller holders with equal but
much smaller competence levels. They formulate optimal abstention policies that address
imbalances in both directions: not enough weight for the large holder and not enough
weight for the small holders. When there is not enough weight for the large holder, a
coordinated abstention response is required from the large mass of small holders, which
is much less plausible than an optimal response by the single large holder in the opposite
situation in which that holder has too much weight.
37

---

## Page 40

gagement is optimal. That happens if a large proportion of potential voters
are epistemically ignorant with p = 0.5 and corresponding optimal weights
of 0. As we have discussed, it may be rational for these potential voters to
be in this state of ignorance. Low participation can be optimal whether it is
terms of percentage of voting rights exercised or in terms of the proportion
of voters participating at least in part. 16
5 Transfer Delegation
As suggested in subsection 2.3, considering transfer delegation requires adding
an additional dimension to the concept of competence:Delegative competence
is the ability to delegate voting rights in a way that increases the probability
of a correct collective decision. Delegative competence is distinct from epis-
temic competence, which has been the sole focus in the previous sections.
Recall that epistemic competence of voter i is the probability, pi, that the
voter acting alone will reach the correct collective decision. It is plausible
that epistemic and delegative competence are positively correlated to some
degree, but they are distinct.
Delegative competence itself has multiple components. One component
is weight competence, the ability to ascertain what the optimal weights are
for other voters in the independence case or to ascertain independent signals
and their associated optimal weights in the case of dependencies. The other
components do not lend themselves easily to a taxonomy and definitions.
An illustration of some of the considerations flows from the following def-
inition: Weight omniscience consists of knowing the optimal weights for all
of the voters who will participate in the case of independent epistemic com-
petencies or for all the signals that are present if there are dependencies.
If there is an individual or entity with weight omniscience, the best possi-
ble collective decision is attainable through a two-step transfer delegation
process:
1) Voters delegate all of their voting rights to the individual or entity with
weight omniscience.
16One idea is to include an “abstain” option so that voters can signal engagement
without voting for an alternative. Doing so might add to the perceived legitimacy of the
choice process. But some of the reasons that motivate rational ignorance such as owning
a very small stake in the DAO suggest that many voters may forgo this costly step.
38

---

## Page 41

2) That individual or entity delegates voting rights to voters (or signals
in the case of dependencies) based on their optimal weights, and all of
those parties (or signals) vote without delegating further. 17
It is possible to achieve the same result through abstention. The omniscient
individual or entity instructs all the other voters how many voting rights to
exercise based on a calculation using optimal weights and the value R as
described in Proposition 3.2.
The added element of delegative competence under both of these ap-
proaches is that the voters must know that a particular individual or entity
has weight omniscience. To know that, the voters must be able to assess
the delegative competence of other voters, which goes beyond weight com-
petence, the ability to discern the optimal weights of other voters. The sit-
uation becomes even more complex in a multi-step transfer delegation. The
voters then need to know how competent other voters are at identifying the
delegative competence of other voters. If many steps are permitted, the sit-
uation becomes even more complicated as voters must be able to assess how
delegative competencies play out in a lengthy multi-step chain.
The example of what can be accomplished if there is an individual or
entity with weight omniscience illustrates another aspect. To exploit the
capabilities of this entity or individual purely through transfer delegation as
opposed to an approach based on partial abstention, the delegative process
must have at least two steps. The omniscient voter receives voting rights in
the first step but needs the second step to optimally re-delegate them.
More generally, when transfer delegation is the choice method, an impor-
tant structural parameter is the number of delegative steps that are allowed.
We consider three separate cases:
Assumption 8A (Single-step transfer delegation): Voters delegate
in a single step. After that step is completed, no further transfer delegation
is permitted.
Assumption 8B (Unlimited-step transfer delegation - liquid dem-
ocracy): Voters delegate in a series of rounds. Following each round, voters
observe the outcome of that round and may change their transfer delegations
17If participation is less than 100%, the individual with weight omniscience can achieve
the best possible collective decision conditional on the restricted voting pool.
39

---

## Page 42

accordingly. The rounds continue until no voters want to change their trans-
fer delegations in response to the previous round.
Assumption 8C (Multiple-step transfer delegation): Voters dele-
gate in a limited and fixed number of rounds. After each round, voters may
change their transfer delegations after observing the outcome of the previous
round. After the final round, no further transfer delegation is permitted.
We also will consider sortition, a method of delegation that operates by
choosing a random sample of voters who then vote as a group to make the
collective decision. Sortition can operate on a one-voter-one-vote basis or can
add members based on metrics such as token holding, an approach which
makes representation more likely for parties weighted more heavily by the
chosen metric. Under this second approach, parties may end up with multiple
votes within the chosen decision group.
All four of these methods of delegation are accompanied by diverse impor-
tant nuances and a substantial literature. A full discussion of the epistemic
properties of each method might require multiple lengthy papers. We limit
ourselves here to a few major insights that follow from the framework and re-
sults we have derived so far, devoting a separate subsection to each method.
Before doing so, we discuss a single delegator’s decision and relate it to some
practical developments. And after considering each of the methods, a fi-
nal subsection examines the choice of the delegate slate, the set of possible
delegates available to voters.
5.1 List-based Transfer Delegation
A delegator uses list-based transfer delegation when the delegator chooses
to allocate voting rights to more than one delegate from a list set by the
delegator, with rules specifying how to move forward if some delegates are
unavailable. The list may include the delegator. List-based transfer delega-
tion is a topic of current significance. 18
18For instance, Graham Novak, a pioneer in introducing this kind of delegation, has
been active in its potential development. Novak called a first version, “Rank-Choice Del-
egation,” which he described as follows: “[E]ach voter delegates their votes to an ordered
list of preferred delegates. The voting delegate who is highest on a voter’s list [and avail-
able] will add the voting power of the voter to their vote. [There is a] greater probability
40

---

## Page 43

Consider the implications of the Optimal Weighting Theorem for the
transfer delegation decision of a single individual or entity assuming one-step
transfer delegation and no ability to coordinate with others. In this case, if
potential delegates have independent competencies, the Optimal Weighting
Theorem dictates that delegators should spread their voting rights across
multiple delegates, including possibly retaining some voting rights as a “self-
delegation,” using weights based on the probabilities that each delegate will
vote in accord with the objectives of the delegator. This approach is superior
to simply allocating all voting rights to the single delegate with the highest
epistemic competency with respect to the delegator’s objectives if any of the
other delegates has a positive optimal weight.
Because optimal weights are absolute quantities in the independence case,
they do not need to be recalculated if some delegates are not available. How-
ever, in the case of unavailability of some delegates, it is necessary to reallo-
cate the voting rights proportionally based on the remaining weight structure.
If there are dependencies, re-weighting based on lack of availability of some
delegates is more complex. 19
These results with respect to list-based delegation apply independent of
whether voters share the epistemic objective of reaching a correct collective
decision or have instrumental objectives such as identifying and promoting
their own preferences with respect to the collective choice. The latter situa-
tion is particular pertinent if there is no correct collective choice and the col-
lective decision process aggregates preferences instead of information. When
preferences are the focus, voters will want to delegate to parties able to dis-
cern and implement their preferences as in the main model in Bloembergen
et al. (2019). The Optimal Weighting Theorem applies for voter j’s delega-
tion decision except that each probability pi is the probability that delegate
i correctly discerns voter j’s preferences with respect to the binary collective
that someone’s interests are represented in each vote since there a many fallbacks.” Novak
(2024).
19Suppose there are 11 independent signals and 10 delegates. Assume that the first ten
signals each are received by only one of the 10 delegates, but the eleventh signal is received
by both delegate 1 and delegate 2. Suppose also that the eleventh signal is the one with by
far the highest optimal weight and that all the other signals have equal optimal weights.
In this scenario, if all delegates are available, delegates 1 and 2 will receive equal voting
rights and much higher levels than the other delegates if the delegator acts optimally.
Suppose that the situation changes so that all delegates except delegate 1 are available.
Re-weighting by just using the weights for the other nine delegates in the full availability
situation is not optimal. It would underweight the eleventh signal.
41

---

## Page 44

decision rather than the probability that delegate i will make the correct col-
lective choice between the two alternatives in the environment of Assumption
1 in which there is a correct collective answer.
5.2 Transfer Delegation in One Step or a Finite
Number of Steps
Proposition 3.2 establishes that, in the case of independent competencies, it
is always possible to create a pattern of abstention that results in optimal
weights and the highest probability of making a correct collective decision.
It is obvious that transfer delegation can achieve the same result. Voters
with too many voting rights can delegate them to voters with too few in
such a way that the proportion of voting right holdings exactly matches
the proportions derived from the optimal weights. 20 However, the coordi-
nation problems are much more difficult and the information requirements
are much more stringent for transfer delegation to be successful than for
implicit delegation through abstention. In fact, optimal transfer delegation
in a decentralized environment is very difficult to attain even assuming in-
dependent competencies regardless of the number of steps. We begin with
the following Proposition, stated in terms of a single transfer delegation step:
Proposition 5.1 Consider a single voter who is deciding: (1) whether
to delegate at all by explicit transfers of voting rights; and (2) if transfer
delegation is indicated, to whom to delegate and in what amounts. Assume:
(A) Independent competencies, and all epistemic competencies are positive.
(B) All other voters have delegated, and the net result of their transfer del-
egations is known by the voter.
(C) The voter knows which parties are in the set ¯V of other voters or dele-
gates who will actually exercise at least some of their voting rights and
20If some voters have negative optimal weights, that is, wi < 0, then we rely on As-
sumption 3 that voters know their optimal weights and also on Assumption 2 that voters
share the epistemic objective of maximizing the probability of a correct collective deci-
sion. Based on these assumptions, negative optimal weight voters will vote the opposite
of their inclinations on the binary choice at hand, and the transfer delegation participants
can treat them as if they had positive optimal weights equal to |wi|.
42

---

## Page 45

knows the number of voting rights ¯tj that each such voter j ∈ ¯V will
exercise.
(D) The voter knows the optimal voting weights for all the participants in
the set ¯V .
If voter i is minimally decisive given the profile of voting rights exercise by
the other active participants, ¯t =
 ¯t1, ¯t2, . . . ,¯t| ¯V |

, then the information in
(C) and (D) is sufficient for voter i to make transfer delegation decisions
that weakly increase the probability of a correct collective decision. For most
voters, this information will be necessary as well as sufficient.
Proof. Under assumption (C), the voting weight for voter j in ¯V is
¯tj. Denote the optimal weight for voter j ∈ ¯V as wj, consistent with our
notation in the rest of the paper. Voteri, who is making the potential transfer
delegation decision, is not a member of the set ¯V . Based on assumption (C),
voter i is able to discern the set of winning coalitions if voters are restricted to
¯V : A subset S ⊆ ¯V is a winning coalition if and only ifP
j∈S ¯tj > 0.5P
j∈ ¯V ¯tj.
I.e., winning coalitions consist of groups who have more than half of the
voting rights.
Parallel to the discussion preceding Lemma 3.5, define:
T ∗
−i = min
A⊆ ¯V ,B= ¯V /A

X
j∈A
¯tj −
X
k∈B
¯tk
 .
Because voter i is minimally decisive, it must the case that ¯ti > T ∗
−i. By
assumption (C), voter i has enough information to determine the set of win-
ning coalitions, and can observe the structural cases in which voter i is po-
tentially decisive. Assuming a rich enough environment to rule out ties, con-
sider the winning coalition, Wm ⊆ ¯V and the corresponding losing coalition,
Lm = ¯V /Wm, that characterize the minimum difference, T ∗
−i, and a small
enough voting rights delegation Dsmall by voter i so that only outcomes in-
volving this pair of coalitions are affected.
If W ¯V is the set all winning coalitions considering only voters in ¯V , then
the probability of making the correct collective choice is:
P =
X
S∈W ¯V
Y
j∈S
pj
Y
k /∈S
(1 − pk).
43

---

## Page 46

Consider the term in this sum associated with Wm:
Tw =
Y
j∈Wm
pj
Y
k∈Lm
(1 − pk).
The key question is whether voter i should delegate Dsmall to one or more
voters in Lm in order to make Lm a winning coalition with the consequence
that the term in P changes from Tw to:
Tl =
Y
j∈Lm
pj
Y
k∈Wm
(1 − pk).
In order to make this choice, by Lemma 4.2 the voter needs to answer the
question: X
j∈Wm
wj ≶
X
k∈Lm
wk?
But then assumption (D) becomes necessary. To apply Lemma 4.2 to answer
the question, voter i needs to know the optimal weights for all the voters in
¯V . If the inequality is less than, then voter i should delegate to one or more
members of Lm, reversing the structure flowing from the voting rights pro-
file ¯t that made Wm a winning coalition.
If the inequality is greater than, voter i could move to the winning coali-
tion creating the next smallest gap between the voting rights in a winning
and a losing coalition. Any transfer delegation made with respect to those
two coalitions would also need to satisfy the constraint not to reverse the
correct structure for the first set of coalitions, the coalition pair that created
the smallest gap. Much more generally, voter i could attempt to use an algo-
rithm that considered all pairs of winning and losing coalitions with respect
to which voter i is decisive. It is likely that a maximizing algorithm is pos-
sible at least by brute force, but we leave that possibility to future work.
If a voter has a low number of voting rights, then it is clear that the
information embodied in assumptions (C) and (D) is necessary as well as
sufficient. For example, if the voter is only decisive with respect to one pair
of winning and losing coalitions, the exact structure becomes crucial. The
voter cannot use some simple rule like delegating to the party with high-
est ratio wi
¯ti
. That might cause the losing coalition to win when it would
be better if it remained the losing one in the pair. The optimal weights in-
formation becomes much more important relative to information about the
44

---

## Page 47

profile of voting rights exercise for voters with very large shares of the to-
tal voting rights. For example, if a voter has almost all of the voting rights
and knows the optimal weights for the rest of the voters, ignoring the profile
of voting rights exercise will not matter much. The voter can delegate in a
way that comes close to replicating the pattern of optimal weights. But for
most voters, knowing both the profile of voting rights exercise and the opti-
mal weights for the other voters will clearly be necessary as well as sufficient
conditions. □
This Proposition indicates the difficulties inherent in achieving optimal
results using one-step transfer delegation. First, there is a coordination prob-
lem. The Proposition avoids this problem through assumption (B). In an
actual one-step transfer delegation, delegation is occurring simultaneously
and no one delegate will know the result of the delegation choices of all oth-
ers prior to making their own delegation decision. On the information side,
under assumptions (C) and (D), the voter needs to know ¯V , the set of par-
ticipants who will actually exercise their voting rights, the number of voting
rights each participant will exercise, and the optimal weight for every voter
in ¯V . The last condition requires weight omniscience with respect to the
set ¯V . Furthermore, these information requirements will be necessary for all
or almost all participants in order for them to delegate by explicit transfers
optimally.
One hope is that multi-step transfer delegation may make the challenge
of optimal transfer delegation less difficult by making coordination easier.
In a multi-step transfer delegation, it is plausible to assume that all voters
can observe the outcome of the previous step. However, if there are a fixed
number of steps, the exact same coordination problem will tend to arise
as in one-step transfer delegation. Voters must execute one-step transfer
delegation on the final step. 21 We discuss transfer delegation that admits
an unlimited number of steps next. That mode of transfer delegation also
involves information needs, potentially as pervasive as those delineated in
Proposition 5.1. We will examine some of the information assumptions that
appear in the relevant body of literature and how those assumptions affect
epistemic outcomes.
21We say “tend” because there are some circumstances involving voter knowledge of
the epistemic competencies of others combined with particular social network properties
that make coordination to achieve an optimal outcome for multi-step delegation possible.
But the required assumptions are very strong. See Proposition 5.3 on page 53 and the
accompanying discussion infra.
45

---

## Page 48

One of the assumptions that appears in several of the papers we discuss
in the next subsection we call high local delegative competence: Voters have
high delegative competence with respect to a limited number of other voters
even though they have little knowledge of the epistemic competencies of the
vast majority of other voters. This assumption suggests a general point that
provides important perspective with respect to the results in Proposition 5.1.
When governance involves a small group of individuals who know each other
well and engage in repeated collective group decisionmaking, voters may well
know the epistemic competencies of others and how delegation might affect
the probability of making the correct collective decision. Assuming a shared
epistemic objective and that all voters know both the views of every other
voter through deliberation prior to a vote or otherwise and every other voter’s
optimal weight, there is no reason even to delegate. Each voter can use the
Optimal Weighting Theorem to compute the decision that will maximize the
probability of making a correct group choice and then vote accordingly. The
result will be a unanimous vote for the more promising of the two alternatives.
In the more general case involving a large group and a setting in which
voters only have knowledge about a small subset of other voters, there is no
immediate epistemic solution. Nonetheless, the fact that there is a degree
of local delegative competence has the potential to strengthen the epistemic
properties of multi-step delegation. It is not a surprise that scholars have
considered the impact that might accrue by making the assumption of high
local delegative competence. In the next section, we discuss results from the
literature and extend them by discussing voter behavior and coordination
methods than strengthen the epistemic properties of liquid delegation.
5.3 Transfer Delegation with Unlimited Steps: Liquid
Democracy
One form of transfer delegation of both theoretical and practical interest for
DAO governance is liquid democracy. Advocates such as Hardt and Lopes
(2015) state the case for liquid democracy versus direct democracy and repre-
sentative democracy. Direct democracy is the method of many DAOs. Token
holders, the population, vote directly on every proposal concerning the DAO.
As Hardt and Lopes (2015) note, although direct democracy offers ”control,
accountability and fairness,” it is also the case that “engagement falls off
in large groups since voters generally do not have time or expertise to vote
46

---

## Page 49

on everything,” a phenomenon that is extensively present for DAOs. 22 Rep-
resentative democracy in which representatives are elected for fixed terms
can enhance expertise but has other issues. Hardt and Lopes (2015) note
that these issues include “problems with transparency, accountability, high
barriers to entry in becoming a representative, abuses of power, focus on su-
perficial aspects of candidates, and decisions being influenced by the election
process itself, e.g. election cycle effects.”
Liquid democracy allows voters to delegate and re-delegate their voting
rights. Token holders can override their transfer delegations at any time
to form new transfer delegations or to vote directly themselves. Hardt and
Lopes (2015) note that the “ability to override and vote directly gives the
control, fairness, and transparency of direct democracy” while at the same
time securing the ability to be represented by others with more expertise.
An initial question is whether liquid democracy with no limit on the num-
ber of rounds will reach a stopping point. One problem is cycles, which occur
if the transfer delegation process returns the voting rights to the original del-
egator after a certain number of rounds. For example, in successive rounds A
delegates to B, B delegates to C, and C delegates to A. Cycles have no stop-
ping point. Even without cycling, there is the question of the existence of
an equilibrium in which an allocation of voting rights is reached at which no
voter wants to change their transfer delegation. And if there are equilibria,
there is the further question of whether the transfer delegation dynamics in-
herent in a liquid democracy instance reach an equilibrium. Finally, even if
an equilibrium is attainable, there is the epistemic question of whether it is a
good outcome with respect to the probability of making a correct collective
decision.
Many results are quite negative. For instance, Escoffier et al. (2019) ex-
amine implementation of liquid democracy in social networks. They start by
eliminating the possibility of cycles by simply assuming that voters caught in
a cycle will abstain. Even after taking that step, they find that the existence
of a Nash-equilibrium is not guaranteed in general, and that it is guaranteed
independent of the profile of voter preferences if and only if the social net-
work is a tree, that is, in addition to the absence of cycles, every voter is
connected to every other voter by some path. But then they show that for
some tree social networks and reasonable transfer delegation dynamics (such
22See note 1 supra.
47

---

## Page 50

as changing transfer delegation at each round only if doing so improves the
outcome for the delegator), the liquid democracy process does not converge.
Putting aside the very real possibility that the liquid democracy process
will not terminate if the number of steps is unlimited, both theoretical and
empirical work indicate that from an epistemic standpoint there is a danger
of over-delegation, the concentration of excessive voting power in the hands
of one or a few delegates. Consider the following example in which liquid
democracy results in an extreme case of the whale problem discussed on page
36:
Example 5.2. Assume the same framework as Example 2.1. There are
3000 voters with weight wi = 0.1 (pi ≊ 0.525) each with 1 voting right, and
one voter with weight wi = 1 (p ≊ 0.731) who has 10 voting rights. Majority
rule based on voting rights is the decision criterion. Assuming independent
competencies, the voting rights proportions exactly match the optimal weight
proportions. If all holders fully exercise their voting rights, the probability
that the collective decision will be correct is 0 .997, and the more competent
voter has negligible effect. Now suppose that the voters use a liquid democ-
racy approach to delegate before the vote, that each voter can ascertain the
competence of any other voter, and that voters search exhaustively for a
voter with higher competence and then delegate to that voter, only stopping
the process if they can find no such voter. Then all voting rights will be del-
egated to the single high-competence voter, and the probability of a correct
collective decision will plummet to 0 .731 from the majority vote outcome of
0.997. Each low competence voter has thrown out their independent infor-
mation, which would otherwise have made a correct collective choice more
likely. □
Unfortunately, the work of several researchers suggests that this result
is not an anomaly, but may be in some sense be typical. We discuss four
articles. Three of them are theoretical and use high local delegative compe-
tence assumptions, which we have mentioned increase the potential for liquid
democracy to have good epistemic outcomes.
Kahng et al. (2021) assume that each voter i chooses from among a set
of voters known to i an unordered approved subset of voters J such that
pj − pi > α ∀ j ∈ J where α > 0 is a parameter common to all voters.
They consider local transfer delegation mechanisms, which include delegat-
ing randomly to a member of the approved subset but do not include choosing
48

---

## Page 51

the most competent member among them as a mechanism. Roughly speak-
ing, they find that there are no local mechanisms that can both create the
prospect of some level of positive gain and guarantee that losses are below
any particular minimum as the number of voters gets large. They note the
reason for the result: “The main idea [underlying the result] is that liquid
democracy can correlate the votes to the point where the mistakes of a few
popular voters tip the scales in the wrong direction. As we show ... this is
unavoidable under local transfer delegation mechanisms, which, intuitively,
cannot identify situations in which certain voters amass a large number of
votes.”23
In response to these results, Kahng et al. (2021) develop a “non-local
mechanism” that does meet both properties, positive gain and minimal loss.
A key feature of the algorithm is that it caps the number of votes that can
accrue to each delegate. The cap is pretty severe, being o
p
ln(n)

where
n is the number of total votes. Even if n is in the millions, each delegate
is limited to a handful of votes. A likely pattern is a large number of dele-
gates, each with a similar number of delegated votes. This pattern is remi-
niscent of many forms of representative democracy which have the property
that voters are allocated in roughly equal numbers or at least numbers of
the same order of magnitude across a fixed number of representatives. This
pattern clearly blocks over-delegation. The analogy is not precise because
voters in representative democracy do not have the ability to allocate their
votes to representatives outside of their voting jurisdictions. But the analogy
strongly suggests that it would not be a surprise if some forms of represen-
tative democracy proved superior to liquid democracy. Some of the results
we discuss next suggest that direct democracy in the form of majority vot-
ing also may be superior to liquid democracy. Thus, contra the idealism that
liquid democracy combines the best features of both representative democ-
racy and direct democracy, it may be epistemically inferior to both of them
individually.
Bloembergen et al. (2019), in a section of their article in which they adopt
the Kahng et al. (2021) framework, assume that voters choose the highest
competence delegate (including self-delegation) and obtain similar results to
the Kahng et al. (2021) findings. As the network degree increases, the prob-
ability of liquid democracy reaching a correct majority outcome decreases
along with a decrease in the number of “gurus,” those voters remaining af-
23Kahng et al. (2021, p. 1238).
49

---

## Page 52

ter transfer delegation is completed. They conclude: “Simply put, giving
all the weight to a small group of gurus increases the chance of an incorrect
majority vote, assuming that gurus have a less than perfect accuracy.” 24
In an extensive and well-constructed empirical analysis of liquid democ-
racy in practice spanning 250,000 votes and 1,700 proposals across 18 DAOs,
Hall and Miyazaki (2024, p. 3) find that “delegation is somewhat lumpy,
leading some delegates to amass considerable voting power, consistent with
theoretical concerns about over-delegation.”
In an elegant paper, closely related to the work here, Mooers et al.
(2024) engage in a theoretical and experimental examination of liquid democ-
racy, comparing it to majority voting and majority voting with abstention
(“MVA”). The authors see themselves as “studying variations of majority
voting,”25 and perhaps for this reason, votes are indivisible. As a conse-
quence, MVA consists of either voting or entirely abstaining, and transfer
delegation also is all or nothing.
The authors conduct two experiments. Both experiments and the asso-
ciated theory are based on the assumption of independent competencies. In
experiment 1, one or more experts all have the same probability, pi = p, of
arriving at the correct decision on their own, and this probability is publicly
known. Non-experts have competencies drawn randomly from a distribu-
tion with support [0 .5, p]. Non-experts know their own competencies, but
this information is private to each non-expert. Delegations shift votes to a
randomly selected expert. In the second experiment, competencies are not
fixed or even known precisely. Participants engage in a perceptual game that
is the competency task. Trial runs of the game provide the estimates of
competencies used to select the top 20% of participants as experts.
In both experiments the probability of a correct collective choice is high-
est for majority voting, closely followed by MVA, with liquid democracy
falling quite far behind, contrary to theoretical predictions based on calculat-
ing equilibria under the variants. These patterns result from over-delegation:
“[I]n both experiments, participants delegate with very high frequency, much
more frequently than they abstain and two to three times more frequently
than optimal in the experiment for which we have precise predictions.”26 The
authors carefully consider some possible reasons for this outcome but do not
24Bloembergen et al. (2019, p. 1802).
25Mooers et al. (2024, p. 21)
26Mooers et al. (2024, p. 38)
50

---

## Page 53

reach a firm conclusion. At the start of the paper, the authors note a “fun-
damental problem ... even if the experts are correctly identified, delegation
deprives the electorate of the richness of noisy but abundant information dis-
tributed among all voters.” 27 At the end of the paper, the authors suggest
that MVA ended up being more robust than liquid democracy in their frame-
work because abstention effectively delegates to all other voters while liquid
democracy delegates only to the expert group. 28 They conclude: “Liquid
democracy should be tested outside of the lab, but our tentative conclusion
is that, on informational grounds alone, the arguments in favor of Liquid
Democracy should be considered with caution.” 29
These problems and trade-offs are not inevitable but stem from the defects
of the choice systems considered, especially when combined with assuming
that votes are indivisible. The strength of partial abstention versus transfer
delegation, majority rule, or MVA with indivisible votes is crystal clear in
the framework of experiment 1 of Mooers et al. (2024) and arguably also in
the frameworks of Kahng et al. (2021) and Bloembergen et al. (2019). All
three frameworks assume high local delegative competence: Participants have
strong information about both their own competencies and the competencies
of at least a subset of other voters.
Consider first experiment 1 from Mooers et al. (2024). Each non-expert
voter knows their own epistemic competence, pi, and the highest level of
competence among all voters, the expert competence, p. Each voter has one
voting right. Using the terminology and results from Corollaries 3.2, 3.3, and
3.4, all voters know R = ln(p)
ln(1−p) = wp where wp is the expert voters optimal
weight, and non-expert voter i can abstain on all but t∗
i = wi
wp
of i’s unit
voting right. If all voters proceed in this manner, the voting weights will be
proportional to the optimal weights under the Optimal Weighting Theorem,
and the probability of the correct collective decision will be maximal. There
are no trade-offs. Each non-expert voter’s independent information, however
modest, will enter into the social decision appropriately weighted.
Kahng et al. (2021) and Bloembergen et al. (2019) assume that voters can
do close comparisons of their own epistemic competencies with at least a sub-
set of other voters. In Kahng et al. (2021), voters are able to identify a subset
whose competencies exceed the voter’s competence by at least some number
27Mooers et al. (2024, p. 1)
28Mooers et al. (2024, p. 38)
29Id.
51

---

## Page 54

α. In Bloembergen et al. (2019), voters are able to rank members of the sub-
set and the voter with respect to competence. These frameworks strongly
suggest that each voter i knows their epistemic competence, pi. What the
voters do not know is the highest competence level among all voters. How-
ever, each voter has a single voting right. The version of partial abstention
exposited in Example 3.7 can achieve the highest possible probability of a
correct collective choice to any degree of approximation desired.
Unlike partial abstention, majority voting, MVA, and transfer delegation
with indivisible votes all result in sub-optimal voting weights and a lower
probability of a correct collective choice in frameworks where voters know
their own epistemic competence. If we permit divisible votes in the instance
of transfer delegation (regardless of the number of steps), achieving an op-
timal result might be possible, but, as indicated by Proposition 5.1 in the
case of one-shot transfer delegation, the coordination problem is much more
difficult than the simple approaches for partial abstention that follow from
Corollaries 3.2, 3.3, and 3.4 and from Example 3.7. There may be reasons
to use methods other than partial abstention in some framework, but with
independent competencies and voter knowledge of their own competencies,
there is not. 30 Based on the literature discussed in this subsection, liquid
democracy appears to be a particularly frail competitor.
To emphasize the relative strength of partial abstention versus transfer
delegation, we consider and analyze transfer delegation in a way that puts it
in a more favorable light. One striking element of some of the current models
of transfer delegation is that they seem to assume sub-optimal behavior by
delegating voters. In these models, voters know the competencies of a subset
of other voters, but they typically delegate to only one of them. As discussed
in subsection 5.1, in the case of independent competencies, the optimal single-
step strategy would be to delegate among the voters in the subset using the
optimal weights specified in the Optimal Weighting Theorem. As we prove
30This conclusion becomes less clear if voters do not have exact knowledge concerning
their own competencies. Consider, for example, experiment 2 in Mooers et al. (2024). In
that experiment, voters do not have precise knowledge of their own competencies or the
competencies of others. Uncertainty about the competency of others is not a problem in
the partial abstention approach because approximation as described in Example 3.7 can
be used in the absence of exact knowledge about the competence of the most adept voter.
On the other hand, uncertainty about own competencies adds complexity. For example,
if voters differ in the precision of own-competency knowledge, it may be optimal to adjust
the weights accordingly, especially if there is social risk aversion.
52

---

## Page 55

subsequently, in some environments this approach also works well when there
are multiple steps.
Consider a directed graph description of a social network in which the
nodes are voters, and each voter knows their own epistemic competence (As-
sumption 3) and the epistemic competencies of some subset of the other
voters. Formally, for each voter i, there is a subset Ni ⊆ N of the voters
whose epistemic competencies are known to i. By Assumption 3, i ∈ Ni,
and, thus, Ni is non-empty. Define a star cluster as a directed subgraph con-
sisting of edges pointing from i to each member of Ni. Note that if Ni = {i},
then the directed subgraph only contains a directed loop from i back to i.
The directed star cluster graph , G, consists of the union of all the star clus-
ters, one for each member of N. Star clusters are overlapping if they share
at least one node. A path between two nodes exists if there is a sequence
of overlapping star clusters that includes both nodes. Define a directed star
cluster graph, G, to be connected if there is a path between every pair of
nodes in G. Then we have the following result:
Proposition 5.3. Assume independent competencies, a shared epistemic
objective, cognizable probabilities, the ability of any voter to observe the out-
come of previous transfer delegation rounds before delegating in the next one,
and voting rights that can be divided into arbitrarily small units. Suppose
that the knowledge of voters about the epistemic competencies of other vot-
ers is characterized by a directed star cluster graph, G. If G is connected,
then using transfer delegation, voters can coordinate on an equilibrium that
results in the highest possible probability of making a correct collective deci-
sion in at most three steps.
Proof. We show there is a three-step coordination method that results
in maximizing the probability of making a correct collective decision. In a
first step, each voter i delegates to members of Ni based on their optimal
weights, which are known to i:
Step 1. Each voter i delegates all ti voting rights held by that
voter proportionally to all members ofNi according to the optimal
weights from the Optimal Weighting Theorem defined in equation
(1) on page 9.
Claim: After this step is complete, all voters have weight omniscience.
To demonstrate the truth of this claim, start with some voter i. For every
53

---

## Page 56

voter k ∈ Ni, the star cluster emanating from i, voter i knows pk and thus
the optimal weight, wk, for voter k. Because G is connected, the cluster Ni
overlaps with at least one other cluster. If instead, Ni were isolated, there
would be no path from i to voters outside of the cluster. Suppose Ni overlaps
with Nj. Then voter i knows the epistemic competency and optimal weight
for at least one voter k ∈ Nj. But voter i also knows the relative weights of
all voters in Nj because those weights are evident from voter j’s delegation
among those voters in step 1. Therefore, voter i can compute the optimal
weight, wy, of every voter y ∈ Nj based on knowing wk and the ratio wy
wk
,
which is equal to the ratio of voting rights that voter j made by delegation
between voters k and y in step 1. For any x ∈ N, voter i can apply this
approach recursively along the sequence of clusters for a path from i to x in
order to learn wx, and the claim is established.
Given that all voters have weight omniscience, there are multiple ways to
coordinate so that the probability of making the correct collective choice is
as high as possible. One simple way is use the following second step:
Step 2. Each voter i delegates their voting rights to all voters,
including i by the self-delegation step of retaining and exercising
some voting rights, in proportion to the optimal weights of the
voters.
Then a third step:
Step 3. Each voter exercises all the voting rights held by that
voter after step 2.
Because each voter delegated using proportions based on the optimal
weights, the aggregate allocation of voting rights after step 2 will be propor-
tional to the optimal weights. If all voters exercise all of their voting rights
in step 3, then the probability of making the correct collective decision will
be as high as possible. □
Proposition 5.3 indicates that given the information structure in which at
least some voters know the epistemic competencies of a subset of other voters,
it is possible in some instances to maximize the probability of making a
corrective collective choice using transfer delegation. Over-delegation effects
are absent along with the consequent possible degradation of decision probity.
54

---

## Page 57

We have only demonstrated this result for the case of social networks that
are connected directed star cluster graphs. 31
The relative strength of partial abstention remains. It will maximize the
probability of a correct collective choice even if the social network is a directed
star cluster graph but is not connected. Partial abstention does not require
any knowledge of the epistemic competencies of others. It would work in the
degenerate case in which each star cluster is a singleton and there is no path
between any two voters.
5.4 Sortition
Use of sortition in social choice systems is a rich topic accompanied by a large
literature. Full consideration of the epistemic aspects would be lengthy. We
limit ourselves to a few basic observations.
Classic sortition consists of choosing a random sample of potential voters
as a decision group on behalf of the entire collective. There are lots of
advantages. Consensus mechanisms such as Algorand choose a new sample
for each governance step, a move that means the selected group cannot be
targeted for bribery or undue influence because their voting power is one
and done.32 The same cannot be said of representatives who are elected for
fixed terms of office. Using a sample of voters may also make deliberation
easier and investment in becoming more informed more attractive because
31If we had a directed star cluster graph that is disconnected, we could reach a solution
if at least one voter in each star cluster reported their epistemic competence, knowing that
these reports are truthful given the assumption of a shared epistemic objective. But then
we are not relying on transfer delegation itself as in the proof above in which each voter i
relies only on that voter’s knowledge about the epistemic competencies of voters in Ni, the
star cluster associated with i, along with knowledge of the observed delegations from the
first round of delegation. As discussed in note 8 and the accompanying text on page 13
supra, the goal is to compare the effectiveness of “candidate” approaches such as transfer
delegation and partial abstention.
32The sortition mechanism employed by Algorand and by other proof of stake consensus
mechanisms such as Ethereum have been very successful. There is a shared epistemic
objective of repeatedly achieving an honest consensus for blocks and very strong economic
incentives for the voters, the network nodes that choose to participate, to adhere to this
objective. It is easy for nodes to get up to speed and operate effectively because they are
engaging in the same task over and over again. The general context we are considering
does not have these features. Decisions generally are ones of first impression and voters do
not opt-in subject to powerful rewards and penalties that motivate reaching the correct
result.
55

---

## Page 58

the decision group is smaller and individual members are more likely to be
decisive.
From an epistemic standpoint, there is a tradeoff if independent informa-
tion is widespread. The information in the hands of excluded voters does not
enter into the decision process. In the case of independent voters with equal
epistemic competencies and a one-person-one-vote approach, Condorcet’s
Jury Theorem runs in reverse because reducing the number of participat-
ing voters lowers the probability of making a correct collective choice, and
a drastic reduction in the total number may have a very big impact. The
widespread information case may be quite common. For instance if voters
also use the services of a DAO, each voter may have a unique perspective
that adds some value, however small, to assessing future approaches. In that
case, every voter is receiving at least one independent signal not received by
any other voter.
If voting using optimal weights is the method, sortition reduces the prob-
ability of making a correct collective decision in the independent competen-
cies case if voters who have positive weights are excluded. The situation is
as if we had the full population participating but incorrectly set these vot-
ers’ weights to zero. By the Optimal Weighting Theorem, the probability of
a correct collective decision will fall as a result of this miss-weighting.
One well-known problem of sortition, discussed, for example, in Lever
(2023) is that differential willingness to serve may create distortions in the
representativeness of the selected group. The actual group consists of those
randomly selected minus the unwilling. The epistemic version of this prob-
lem is that the unwilling may have particular characteristics that reduce
the epistemic outcome if they exclude themselves. For example, if poten-
tial participants with higher expertise are less willing to serve due to the
time commitments to deliberations and voting processes required but would
be perfectly happy to be informed voters otherwise, sortition may result in
a group with lower average epistemic competence than the population. In
the case of independent competencies, the selected group will have a lower
probability of reaching a correct collective choice in any system with fixed
weights such as one-person-one-vote as well as any system that employs op-
timal weights.33
The random nature of sortition also creates uncertainty, especially if the
chosen group is small. By chance the group may include voters with below
33With respect to the fixed weights case, see Lemma 3.5 supra.
56

---

## Page 59

average competencies when competencies are independent, and when they
are dependent, the group may contain voters that have received similar inde-
pendent signals to the exclusion of others. On the other hand, in a flooding
situation, the selected group may by chance include a disproportionate num-
ber of highly competent voters whose influence might otherwise be washed
out in a system that does not use optimal weights in the voting rule.
Overall the epistemic consequences of sortition are complex and may de-
pend on particular group draws. But it is clear that there is potential for a
major epistemic impact compared to any particular baseline voting rule that
is the alternative for choice by the whole population.
5.5 The Delegate Slate
So far, we have considered the situation of a fixed delegate slate: The set of
possible delegates is fixed. But there is another aspect of transfer delegation
that often will have a major impact: adding and subtracting delegates who
are not otherwise in the system as voters.
Consider the independent competencies setting in which the voting rule
employs optimal weights across all voters including delegates. Proposition
4.1 indicates that adding delegates with epistemic competencies greater than
0.5 weakly increases the probability of making a correct collective decision.
The same is true in the context of majority voting (one-person-one-vote)
and independent competencies if we add delegates with high enough com-
petencies relative to the existing group. We have the sufficient condition of
Ben-Yashar and Nitzan (2017) discussed on page 31 which is wi + wj > w 1
where i and j are the added voters and voter 1 is the most competent voter
in the existing group.
For rules other than the use of optimal weights, it is clear that all of the
dangers identified in section 4 can arise if delegates are added or subtracted
from the slate: the flooding danger, the dependency danger, and the epis-
temic danger from whales. The exact outcomes mix considerations of adding
participants and how the transfer delegation will work. For example, when
many low competence delegates are added, the flooding danger will occur
only if many of these delegates receive actual delegated voting rights.
Although it is hard to say anything in general, it is clear that delegate
slate choices may have a big impact. Policies such as creating very visible
menus of delegates to draw extra delegative participation from relatively
passive voters must be done with care. The composition of the menu and
57

---

## Page 60

whether there are limits on transfer delegation to each delegate may make
a big difference. In subsection 6.1 we discuss some possible attempts to use
delegate slate formation to improve the epistemic performance of DAOs.
6 Shades of Decentralization and Epistemic
Supplements
It is clear that DAO governance may struggle with epistemic performance,
the ability to reach an acceptable probability of making a correct collective
choice or at least one that does well in that regard with respect to the re-
sources available. There are some potentially effective responses that may
be considered compromises versus idealized versions of decentralization such
as governance by majority vote in an environment in which voting power
is not concentrated structurally or in practice. If such ideal forms of DAO
governance are not attainable in practice or if they have significant negative
epistemic consequences, then that degree of decentralization is not viable.
We then need to consider shades of decentralization that have decentralized
features but depart from idealizations that we may wish worked on their own.
We briefly discuss four examples in this section, the last three of which rely
on markets to aggregate information for purposes of governance.
6.1 Systematic Independent Transfer Delegation by
Whales
Proposition 4.1 indicates that DAO participation can be enhanced with no
epistemic cost in the optimal epistemic environment. This environment re-
quires that voting conform to the optimal weights specified by the Optimal
Weighting Theorem. That is a tall order for a decentralized system. But
something close may be possible if there are entities or individuals who hold
a substantial portion of DAO ownership, perhaps 20% or more. Suppose
there is at least one such “whale.” Normally, whales are seen as a threat to
decentralization because large stakes can carry with them explicit or implicit
control of the DAO.
Suppose, however, that the whale uses its stake to create a collection of
carefully selected delegates, each of whom are granted independence from
the whale with respect to voting. The whale can select delegates, some of
58

---

## Page 61

whom have no current connection with the DAO, who bring diverse, valu-
able viewpoints to governance and then weight them by transfer delegation
amounts in a way that approximates optimal voting weights. Choosing and
motivating delegates to perform actively and continuously in this framework
creates a powerful block of votes that is likely by itself to exhibit excellent
epistemic performance. Although operating this kind of “governance ma-
chine” does not create precisely the optimal epistemic environment, it makes
added participation by others less likely to have a negative epistemic impact
on outcomes.
The whale’s large stake creates a substantial economic incentive to do
an excellent job of structuring and maintaining such a governance machine.
For instance, a whale with a 40% interest will reap 40% of the economic
returns from good governance. This potential return can justify investment
of substantial resources in terms of money and time. The same cannot be
said for diverse small holders each acting on their own because they each
would reap only a small portion of the returns of any such investment. 34
Even in the case of a 40% whale, the owners of the other 60% free ride
on the whales’s efforts. This dilemma is the Jensen-Meckling problem, first
described by Jensen and Meckling (1976), who point out that the problem
only disappears when ownership reaches 100%. In that case, the owner is
motivated to make the fullest possible effort that is economically justified.
Owners with less than 100% are likely to exert lower levels of effort, causing
the result to fall short of its potential. The contestable control alternative
presented in subsection 6.4 overcomes this problem.
There are examples that appear have some characteristics of systematic
independent delegation by whales. Amico (2021) describes a16z’s token del-
34One intriguing possibility is for a more collective implementation of systematic in-
dependent transfer delegation. For example, instead of implementation by a whale, a
subgroup of smaller holders or the entire group of all DAO token holders could elect a
delegate management entity of some kind to carry out systematic independent transfer
delegation. The subgroup or group could delegate their voting rights to the delegate man-
agement entity as a first step. The trouble with this approach is that it simply shifts the
primary governance problem we are addressing back a step. How do we know that the sub-
group or group will be good at choosing the delegate management entity or at monitoring
that entity’s performance? The Jensen-Meckling problem is present: Small stakeholders
individually may be rationally passive to a large degree with respect to the selection and
monitoring functions because of their modest economic stakes. The benefits of their ef-
forts would flow overwhelming to others, creating the serious collective action problem
that Jensen and Meckling identified.
59

---

## Page 62

egate program, which includes transfer delegation of a large portion of a16z’s
substantial token holdings in several DAO projects to parties such as non-
profit organizations, startups, university organizations, and crypto commu-
nity leaders. Some of these parties are not token holders in the DAOs, and
none of them is required to be such. a16z aims at a “diversity of perspec-
tives” in the mix of its delegates as well as “active users who understand
the protocol and want it to grow, but otherwise lack sufficient voting rights
to participate meaningfully.” This language sounds like an effort to select
epistemically independent delegates each of which have high epistemic com-
petence, a strong formula for epistemic performance. Also, a16z, as a leading
venture capital firm in the cryptocurrency space, is likely to have high del-
egative competence.
Delegation is a key function of management, whether centralized or decen-
tralized. And for independent transfer delegation by whales to be properly
incentivized, the DAO must be an economic DAO, which we defined in sub-
section 2.1 as one for which the aggregate token value reflects the value of the
project. Then a whale’s large token share creates the proper incentives for
the whale to delegate effectively and to identify and introduce new delegates
who will add value. In the background is the need for DAOs to compete with
organizations that employ centralized management.
How much does a governance machine created through independent trans-
fer delegation by whales shade decentralization? Much depends on whether
the delegates are truly independent from the whales. It is possible to create
a contract to embody the independence with a long enough term so that it
is meaningful, but there are other factors, such as a desire to earn a continu-
ation, that may bias delegate votes. There also are regulatory factors. Some
approaches such as the FIT21 legislation passed by the U.S. House of Repre-
sentatives and pending in the U.S. Senate create quantitative ownership tests
that determine regulatory treatment.35 In the case of FIT21, 20% ownership
or more by one token holder is disqualifying for the most favorable regula-
tory status. A good amendment would be to disregard truly independent
transfer delegations for sufficient time periods and in small enough pieces.
35H.R. 4763 is known as the Financial Innovation and Technology for the 21st Century
Act (“FIT21”). H.R. 4763 was approved by the House Financial Services Committee on
July 26, 2023 and passed by a strong bipartisan majority of the full House on May 22, 2024,
creating the possibility of enactment if approved by the Senate and signed by the President.
House Financial Services Committee (2023); House Financial Services Committee (2024).
60

---

## Page 63

That would permit whales with strong incentives to delegate well to be part
of the framework without triggering adverse regulatory consequences.
6.2 Futarchy
Futarchy is the use of prediction markets to make decisions. Hanson (2013)
provides a good summary of the basic ideas. Use of futarchy in DAO gov-
ernance is of great current interest, and projects such as Butter (2025) have
created implementations.
Futarchy works by specifying an issue, creating a prediction market, and
then taking action based on the market outcome. For example, the proposi-
tion might be something like: If the DAO implements policy X, decentralized
exchange turnover will increase to at least Y billion by January 1, 2026. A
market for the proposition is created which pays $1 per contract on January
1, 2026 if the proposition proves to be true and $0 if it proves to be false. At
some point, the DAO observes whether the market favors the proposition and
acts accordingly. If the market favors the proposition, the DAO implements
policy X, and the yes market remains open with the payoff on January 1,
2026 being $0 or $1 depending on the outcome. If the market does not favor
the policy, the market is shut down because the hypothesized event, an out-
come conditional on policy X being implemented, can never occur because
X was not implemented.
As detailed in Snowberg et al. (2013), prediction markets have a good
track record for accuracy. DAOs can use them instead of votes to decide cer-
tain issues.36 Creating a market is costly, and it will not work unless there is
enough participation. Framing the subject proposition also is critical and re-
quires both a choice of objectives and selection of measurable outcomes that
embody the objectives. As a result, there are governance decisions surround-
ing both the choice to use a prediction market for a particular issue and how
to implement the market in that case. Nonetheless, decision quality may be
enhanced compared to voting, especially given some of the potential defects
of voting systems that we have discussed. Futarchy is an alternative epis-
36It may be possible to go beyond merely replacing voting approaches with prediction
markets. Airiau et al. (2024) show that under certain restrictive conditions, including very
particular utility functions, prediction markets can produce outcomes that approximate
voting with optimal weights. We discuss approaches motivated by this result in the next
subsection.
61

---

## Page 64

temic approach, one that depends on markets instead of voting to aggregate
information.
How much does the use of futarchy shade decentralization? Voting is
being superseded, and the exact shape and embedded values in the use of
futarchy for a particular decision might be determined by a handful of parties
even if approved in a routine DAO vote. Nonetheless, market aggregation of
information through a prediction market might be much more effective for
some issues than the aggregation that occurs in voting. And DAO voters
might prefer a prediction market approach for particular decisions. DAOs do
delegate certain management functions to third-parties by contracting with
them. Use of futarchy is at least somewhat analogous.
6.3 Condorcet AI Agents
Airiau et al. (2024) in a paper titled “Condorcet Markets” show that if traders
are endowed with a particular logarithmic utility function of the price in a
prediction market and the amount invested in that market, the utility being
parameterized by single number k, then as k tends toward infinity, the de-
cision implicit in the prediction market price converges to what the decision
under voting based on optimal weights would be. 37 In the author’s words:
“[T]his ... result shows that elections that are perfect from a truth-tracking
perspective [ones that use optimal voting weights] can be implemented in-
creasingly faithfully ... as the parameter k ... grows larger.” 38 Investment
strategies in markets accomplish the otherwise difficult task of “elicit[ing]
truthful weights from agents.”39
Airiau et al. (2024, p. 517) state that whether the approach can prove
valuable in practice requires more research, and they note that the results
are subject to “at least four main limitations, which include use of standard
jury theorem assumptions, the focus on only a one-shot interaction instead
of allowing for iterations, the assumption that agents are price takers, and
the fact that the study is based on “very stylized utility functions that are
the same for all agents.” The standard jury theorem assumptions correspond
to the structure here in the independent competencies case, that structure
including elements such as a binary decision with a correct alternative.
37Airiau et al. (2024, Theorem 5, p. 515).
38Airiau et al. (2024, p. 515).
39Id. at 517.
62

---

## Page 65

Three of these limitations disappear if we consider creating appropriate
AI agents. These agents can be endowed with the precise utility function
associated with approximating a “perfect” voting system result based on
optimal weights. We can specify a sufficiently large value of k for the agents.
We can require them to act as price takers and behave as if they are engaged
in a one-shot interaction at each decision point.
The assumption of independent competencies remains a barrier, but in
some applications we may be able to do well enough by keying particular
agents to particular information sources or by building in an approximation
based on the independent signals framework discussed in section 3 that in-
cluded the possible use of discounts based on the number of agents that share
sources. The agents might be able to compute this number with some degree
of accuracy because elements such as the number of agents are observable as-
pects of the environment. And we have all the tools of AI, both known and
not yet developed, to allow agents to learn and possibly coordinate through
computation and communication.
There is a possibility that we could build something analogous to sys-
tematic independent transfer delegation by whales, a block of AI agents that
come close to operating among themselves using optimal voting weights, to
provide an anchor or supplement to a DAO voting system.
In honor of Airiau et al. (2024), we might call agents in such a system
“Condorcet agents” or “Condorcet AI agents.” Creation of such a system is
an exercise in imagination at this point. Much depends on questions such
as whether AI agent information collection and processing could be strong
enough to make a serious contribution to collective decisions and whether
such agents could accurately estimate the quality of the information they
collect in terms of epistemic competence. Nonetheless, it is clear that there
is a possibility of approximating a nearly “perfect” voting approach using
prediction markets. And it might work for at least certain applications.
6.4 Contestable Control
Strnad (2025) proposes a contestable control approach for DAO governance.
This approach allows any party to initiate an auction to take temporary
control of the DAO, itself contestable through a subsequent auction. Bid-
ders promise to increase the token value by a specified amount and claim
some portion of the resulting market capitalization increase. The bid that
promises the largest value increment to the other token holders wins. Bid-
63

---

## Page 66

ders submit deposits that guarantee performance and that will be slashed
with compensatory payments to the other token holders if the DAO declines
in value during the control period. As a result, the other token holders are
guaranteed the promised increase in token value or its cash equivalent and
are protected against losses by the deposits.
The operation of the auction mechanism exposes the control party to
100% of the gains and losses in value of the entire DAO. As a result, the
control party is in the same position with respect to incentives as a 100%
owner, and the Jensen-Meckling problem disappears.
The auction mechanism is designed so that the bidder with the best
business plan tends to win the auction. This quality is the epistemic aspect
of the mechanism. As in the case of futarchy, the mechanism relies on markets
rather than voting for epistemic performance. 40
After the control period ends, the DAO reverts to its baseline governance
state, typically a voting system such as the ones we have examined in this
paper. As a result, the auction mechanism can provide guardrails for that
voting system. If some of the problems detailed in the rest of this article
threaten the performance of the DAO and there is an accompanying drop in
token value, there are strong incentives for a party to step up and initiate an
auction. The prevailing control party can reset or reform the voting system
and then allow the DAO to revert to its baseline governance state.
40What the auction mechanism adds that futarchy may not provide very well is properly
incentivizing certain major innovations. Bidder business plans are private information, and
the mechanism allows bidders to claim a bidder-specified portion of the surplus that the
bidder’s business plan will produce. Bidders are motivated to claim only what they need
to cover their costs and make a normal profit because the higher their surplus claim, the
weaker their bid is: The auction winner is determined by the bidder who promises to
deliver the most surplus to the other token holders.
If bidders fully revealed their business plans, which would be required for prediction
markets to compare them intelligently, they would be in danger of not earning the surplus
required to motivate creation of the business plan in the first place. After the business
plan is made public, it can be applied without rewarding the inventor. The bidder may
not have or be able to accumulate a large enough stake in the DAO prior to revealing the
business plan to earn sufficient surplus given that token purchases reveal information and
move prices upward and also that in some countries even moderate ownership stakes must
be revealed. This difficulty is a version of what sometimes is known as the “Grossman-
Hart free-rider problem.” Strnad (2024, pp. 13-14). The auction mechanism eliminates
this problem entirely by allowing bidders to claim a specified amount of surplus without
making any token market purchases prior to the auction.
64

---

## Page 67

How much does adding a contestable control mechanism shade decentral-
ization? On the one hand, the mechanism temporarily centralizes control
of the DAO. On the other hand, one purpose of the mechanism is to defeat
the explicit or implicit entrenchment of control that seems to have charac-
terized actual DAOs. 41 In the face of a possible auction, neither whales or
founders can secure on-going control. This feature allows revision when these
traditional control parties are standing in the way of better outcomes for the
DAO. For instance, if a whale implements an independent transfer delega-
tion system for which there is substantial room for improvement, a bidder
can gain temporary control and reform the system. In addition, as men-
tioned, the contestable control mechanism may create conditions that allow
decentralized governance to function well by creating guardrails for desirable
governance features that otherwise might be too risky. Although the mecha-
nism involves temporary centralization, it may prove highly valuable or even
essential for implementing successful decentralization.
The contestable control approach only works well for economic DAOs,
ones for which the token value market capitalization embodies the value of
the project. In that case, the auction creates incentives for substantially
improving project performance. As noted in subsection 2.1, economic DAOs
are not limited to DAOs that are commercial.
For economic DAOs, there is an obvious governance objective that emerges
from capital market pressures: maximizing market capitalization. For any
governance decision, the right answer is the one that maximizes the market
value of the project, an aspect that puts us in an epistemic world in which
Assumption 1, that decisions have a single correct answer, is appropriate. 42
And it does so even in the face of the fact that some of the elements that
drive market value themselves do not easily lend themselves to a right answer
and are not commercial: various normative, political, or moral elements such
as the value of participation in the baseline DAO decision processes. If these
elements matter to participants, then embodying them in the DAO despite
consequent, but lesser, sacrifices in operational efficiency will be reflected in
41See note 1 supra.
42One concern is that this “right answer” may embody shifting the DAO toward a web2
type of operation, leveraging network economies of scale to gain power over consumers
and content creators. However, this danger is present already if the DAO token is traded
because parties can gain control by buying up tokens. The only way that web3 can thrive in
a capital market setting is if there is a large enough base of token investors that some web3
token projects will have market values that depend on promoting web3 characteristics.
65

---

## Page 68

its market value, and winning bidders in a contestable control contest will
be the ones who can best implement them. Futarchy shares some of these
characteristics, especially if the proposition that is the focus includes a pre-
diction of the impact of a particular policy approach on the DAO’s market
value.
7 Conclusion
The major question that we started with is whether governance can be de-
centralized and at the same time be efficient in the sense of arriving at good
policies and solutions. To address that question, we created two epistemic
tests, one for the case where voters’ judgments are independent and the other
for the case where there are dependencies. These tests address situations in
which there is a correct but unknown choice between two alternatives. The
metric is the probability of arriving at the correct collective decision.
We make some strong assumptions about participants’ knowledge and
motivations. Participants know their own epistemic competencies, the prob-
abilities that they would make the correct decision on their own. Participants
share the epistemic objective of achieving the correct collective outcome. In
the case of dependencies, the total information set can be decomposed into
a canonical list of independent signals, and each participant knows the prob-
ability that each signal received by the participant will result in the correct
collective decision.
Despite the strength of these assumptions and the limitation to cases in
which there is a correct answer, we would want DAO governance to perform
well in this environment, especially in the face of competing centralized al-
ternatives. Some important questions considered by DAOs arguably do have
a correct answer, and addressing them poorly may imperil the entire DAO
enterprise whatever its broader aspirations might be. Good performance as
well as decentralization are required for web3 ventures to succeed versus web2
competitors.43 In addition, the outcomes of the epistemic tests have broader
implications for governance.
43The line between questions that have a correct answer and ones that do not is not well
defined in terms of choosing governance structures. Outside of an epistemic framework,
the question becomes: What is the metric we will use to judge governance systems? If
the metric is clear enough, we are back into an epistemic framework in which the goal is
to maximize the probability of strong performance according to the metric. If there is no
66

---

## Page 69

We have shown that even with the strong assumptions we make, it is
very unclear that methods such as various forms of delegation will lead to
good results. The strongest candidate which emerges is partial abstention.
In the independent competencies case, a partial abstention approach makes
it possible for a decentralized governance system to maximize the probabil-
ity of making correct collective decisions or come arbitrarily close to being
able to do so. The degree of coordination required is very low, basically com-
mon knowledge of a particular reference number. In the case of competence
dependencies, however, more is required. Assuming that the decomposition
into independent signals is possible and that voters can identify them, voters
must know how many other participating voters have received each signal
that the voter receives in order to coordinate effectively to maximize the
probability of making a correct collective decision.
Does partial abstention have a chance of being an effective governance
method in practice? Many of the assumptions may fail, and perhaps dra-
matically so, in real world environments. Voters may not have very sound
knowledge of their own competencies. Some may even have negative com-
petencies, pi < 0.5, and not be aware of it. The shared epistemic objective
assumption will not be true if there are malicious actors. In partial ab-
stention approaches, voters may abstain on a large number of voting rights,
which creates an opening for malice because fewer voting rights are required
to succeed at any particular attempted manipulation. This problem might
be ameliorated by adding a final step in which abstained voting rights are
delegated pro rata by the voting mechanism on the basis of the exercised
voting rights. Adding that final step reduces the scope for malice, but the
possibility of malice remains. Aside from actual malice, there is the possi-
bility that voters will ignore the epistemic objective and simply use all of
their voting power to promote their favored alternative. That approach un-
dermines the epistemic qualities of the decision process because such voters
will be over-weighted compared to what is optimal.
To be fair, all of these criticisms apply in one form or another to any
of the decision approaches we have examined. But the questions remain:
Could partial abstention work well enough in an approximate way? Is it
plausible that a sufficient number of voters will share the epistemic objective
of maximizing the probability of making a correct collective decision? If
such metric, even approximately, then it is unclear that we can make systemic judgments
about governance at all.
67

---

## Page 70

so, will voters be sufficiently adept at approximating their own epistemic
competence?
Then there are the difficulties of addressing dependencies. We have mod-
eled dependencies as a decomposition into a set of independent signals. There
are many other ways to do it. For example, we could have focussed on a
covariance matrix. A major reason to consider the independent signals ap-
proach is that voters might be able to approximate optimal strategies when
using partial abstention. As we have seen, one such optimal strategy is for
each voter to discount signals received by dividing the signal weight by the
number of other voters who receive the same signal. It is possible that vot-
ers may have an accurate sense that some of their information sources are
widely shared and could guess at the appropriate discount for such signals.
The bottom line is that the real world case for using a partial abstention
approach is unclear. Experimentation at the laboratory level and in func-
tioning applications is required to study the effectiveness of the approach.
Some of our results with respect to direct participation have potential
significance. Many see value in direct participation even if there are nega-
tive epistemic consequences. We identified an environment in which there
is no such clash. In a voting system that employs optimal weights, added
direct participation never hurts epistemic performance and is likely to have
a positive impact. Departures from that optimal epistemic environment,
however, make added direct participation of certain kinds a substantial epis-
temic threat. The system may be flooded with low competence or highly
correlated voters, which can cause significant epistemic degradation. Voting
rights whales, either large token holders or major delegates, may have way
too much voting weight, which can have serious negative consequences.
Transfer delegation, including liquid democracy, does not fare any bet-
ter. Epistemically appropriate transfer delegation requires overcoming diffi-
cult coordination problems and requires strong voter information about the
epistemic and delegative competencies of other voters. In the epistemic en-
vironments we have studied, transfer delegation is dominated by partial ab-
stention. Because partial abstention does not involve external relative weight
intervention, knowledge about the epistemic and delegative competencies of
other participants is not required. Coordination is much simpler, and, in the
case of independent competencies, is easily attainable. The external rela-
tive weight intervention aspect of transfer delegation creates very substantial
epistemic challenges and an accompanying elevated likelihood of failure.
68

---

## Page 71

It may be that decentralization requires an assist due to the epistemic
difficulties that loom. We considered four possibilities. Systematic inde-
pendent transfer delegation by whales, in which they delegate substantial
voting rights to a panel of delegates who have a high degree of assured inde-
pendence from the whales, has promise. By carefully selecting the panel to
include independent judgments and high epistemic competencies and by ap-
propriately assigning delegation amounts, a whale can construct a big block
of votes that comes close to a vote with optimal weights. If this block is sub-
stantial enough in light of direct participation by voters outside the block, it
may create an approximation to the optimal epistemic environment. If so,
direct participation outside of the block is less likely to have significant neg-
ative epistemic consequences, creating a happy world in which the potential
for conflict between increasing direct participation and achieving epistemic
goals is reduced.
The other three possibilities are based on market approaches. Futarchy
uses prediction markets to make discrete decisions, and the associated market
aggregation of information may be superior to aggregation through voting
mechanisms for some issues. Use of Condorcet AI agents creates the possi-
bility of replicating optimal voting outcomes among a group of such agents,
potentially creating a powerful way to implement systematic independent
transfer delegation. A contestable control mechanism leverages the token
market to create guardrails for DAO governance processes. The epistemic
quality of this mechanism depends on the ability of token prices to represent
the quality of DAO performance in terms of the DAO objectives, whether or
not commercial. The mechanism creates an auction designed to execute the
best possible plan going forward in terms of token market capitalization. If
governance has gone astray because of epistemic defects, the mechanism pro-
vides a path for a reset or reform of the governance system. In that case the
potential plans that are the subject of the auction are governance plans.
Many questions flow from what we have discussed: How close do we need
to be to optimal voting weights to ameliorate possible epistemic losses stem-
ming from various kinds of increased participation? Are there methods of
moving toward optimal weights that are related to independent transfer del-
egation by whales but that have more a decentralized nature? Will those
methods work without the incentives that stem from substantial token own-
ership? Can transfer delegation approaches be devised that overcome some
of the epistemic weaknesses and difficulties that appear to be present? Would
69

---

## Page 72

an assist from AI agents help under any of the approaches? Does the partial
abstention approach have practical utility?
Because epistemic performance is central to the survival and flourish-
ing of any governance institution, answers to these questions in the case of
DAO governance would be immensely valuable. The epistemic tests we have
employed in this paper have helped to frame and sharpen these questions.
Although epistemic tests cannot on their own provide solutions guaranteed
to work in practice, we believe that researchers and DAO participants should
consider them as potentially very useful tools to advance the understanding
of decentralized governance.
70

---

## Page 73

References
Airiau, St´ ephane, Nicholas Kees Dupuis, and Davide Grossi (2024) “Con-
dorcet Markets,” in Algorithmic Game Theory, 501–519: Springer Nature
Switzerland.
Amico, Jeff (2021) “Open Sourcing Our Token Delegate Program,” a16z
crypto, https://a16zcrypto.com/posts/article/open-sourcing-our-
token-delegate-program/.
Bar-Isaac, Heski and Joel Shapiro (2020) “Blockholder voting,” Journal of
Financial Economics, 136 (3), 695–717.
Ben-Yashar, Ruth and Shmuel Nitzan (2017) “Are two better than one? A
note,” Public Choice, 171 (3–4), 323–329.
Ben-Yashar, Ruth and Jacob Paroush (2000) “A nonasymptotic Condorcet
jury theorem,” Social Choice and Welfare , 17 (2), 189–199.
Bloembergen, Daan, Davide Grossi, and Martin Lackner (2019) “On Rational
Delegations in Liquid Democracy,” The Thirty-Third AAAI Conference on
Artificial Intelligence (AAAI-19), 1796–1803.
Brennan, Jason (2016) Against Democracy: Princeton University Press.
Buterin, Vitalik (2022) “DAOs are not corporations: where decentraliza-
tion in autonomous organizations matters,” https://vitalik.eth.limo/
general/2022/09/20/daos.html, Blog post September 20, 2022.
Butter (2025) “Butter,” https://butterd.notion.site/, Accessed Febru-
ary 11, 2025.
de Condorcet, Marquis (1785) Essai sur l’application de l’analyse ` a la proba-
bilit´ e des d´ ecisions rendues ` a la pluralit´ e des voix: De l’imprimerie royale
(Paris), https://gallica.bnf.fr/ark:/12148/bpt6k417181/f4.item.
Dietrich, Franz and Kai Spiekermann (2023) “Jury Theorems,” in Zalta,
Edward N. and Uri Nodelman eds. The Stanford Encyclopedia of Philoso-
phy, Spring 2023 edition: Metaphysics Research Lab, Stanford University,
Spring 2023 edition.
71

---

## Page 74

(2024) “Deliberation and the wisdom of crowds,” Economic Theory,
79 (2), 603–655.
Dixon, Chris (2024) Read Write Own: Building the Next Era of the Internet :
Random House.
Escoffier, Bruno, Hugo Gilbert, and Ad` ele Pass-Lanneau (2019) “The Con-
vergence of Iterative Delegations in Liquid Democracy in a Social Net-
work,” in Algorithmic Game Theory, 284–297: Springer International Pub-
lishing.
Feddersen, Timothy J. and Wolfgang Pesendorfer (1996) “The Swing Voter’s
Curse,” American Economic Review, 86 (3), 408–424.
Feichtinger, Rainer, Robin Fritsch, Yann Vonlanthen, and Roger Wattenhofer
(2023) “The Hidden Shortcomings of (D)AOs – An Empirical Study of On-
Chain Governance,” https://doi.org/10.48550/arxiv.2302.12125.
Fritsch, Robin, Marino M¨ uller, and Roger Wattenhofer (2024) “Analyz-
ing voting power in decentralized governance: Who controls DAOs?”
Blockchain: Research and Applications , 5 (3), Article 100208.
Hall, Andrew and Sho Miyazaki (2024) “What Happens When Any-
one Can Be Your Representative? Studying the Use of Liquid
Democracy for High-Stakes Decisions in Online Platforms,” https:
//www.gsb.stanford.edu/faculty-research/working-papers/what-
happens-when-anyone-can-be-your-representative-studying-use ,
October 30, 2024.
Hanson, Robin (2013) “Shall We Vote on Values, But Bet on Beliefs?” Jour-
nal of Political Philosophy , 21 (2), 151–178.
Hardt, Steve and Lia C R Lopes (2015) “Google Votes: A Liquid Democ-
racy Experiment on a Corporate Social Network,” Technical Disclosure
Commons: Defensive Publication Series , https://www.tdcommons.org/
cgi/viewcontent.cgi?article=1092&context=dpubs series.
House Financial Services Committee (2023) “House Finan-
cial Services Committee Reports Digital Asset Market Struc-
ture, National Security Legislation to Full House for Con-
sideration,” https://financialservices.house.gov/news/
documentsingle.aspx?DocumentID=408940, July 26, 2023.
72

---

## Page 75

(2024) “House Passes Financial Innovation and Tech-
nology for the 21st Century Act with Overwhelming Bipar-
tisan Support,” https://financialservices.house.gov/news/
documentsingle.aspx?DocumentID=409277, May 22, 2024.
Jensen, Michael C. and William H. Meckling (1976) “Theory of the firm:
Managerial behavior, agency costs and ownership structure,” Journal of
Financial Economics, 3 (4), 305–360.
Kahng, Anson, Simon Mackenzie, and Ariel D. Procaccia (2021) “Liquid
Democracy: An Algorithmic Perspective,” Journal of Artificial Intelli-
gence Research, 70, 1223–1252.
Khanna, Vikramaditya S. (2022) “Shareholder Engagement in the United
States,” in Harpreet Kaur, Christoph Van der Elst Anne Lafarre, Chao Xi
ed. The Cambridge Handbook of Shareholder Engagement and Voting ,
Chap. 12, 239–260: Cambridge University Press.
Lever, Annabelle (2023) “Democracy: Should We Replace Elections with-
Random Selection?” Danish Yearbook of Philosophy, 56, 136–153.
Liu, Xuan (2023) “The Illusion of Democracy? An Empirical Study
of DAO Governance and Voting Behavior,” SSRN Electronic Journal ,
http://dx.doi.org/10.2139/ssrn.4441178.
Mooers, Victoria, Joseph Campbell, Alessandra Casella, Lucas de Lara,
and Dilip Ravindran (2024) “Liquid Democracy. Two Experiments
on Delegation in Voting,” https://arxiv.org/abs/2212.09715,
arXiv:2212.09715v2.
Nitzan, Shmuel and Jacob Paroush (1982) “Optimal Decision Rules in Un-
certain Dichotomous Choice Situations,” International Economic Review,
23 (2), 289.
Novak, Graham (2024) “Introducing Rank-Choice Delegation,” X, https:
//x.com/gnovak /status/1820784566426018074, Posted on X, August 6,
2024.
Paroush, Jacob (1997) “Stay away from fair coins: A Condorcet jury theo-
rem,” Social Choice and Welfare , 15 (1), 15–20.
73

---

## Page 76

Reyes, Carla L., Nizan Geslevich Packin, and Benjamin P. Edwards (2017)
“Distributed Goverance,” William and Mary Law Review Online, 59, 1–32,
https://scholarship.law.wm.edu/wmlronline/vol59/iss1/1/.
Snowberg, Erik, Justin Wolfers, and Eric Zitzewitz (2013) “Prediction Mar-
kets for Economic Forecasting,” in Graham Elliott, Allan Timmermann
ed. Handbook of Economic Forecasting, Chap. 11, 657–687: Elsevier.
Spannocchi, Raphael (2025) “A Taxonomy of Voter Intent,” X, https://
x.com/raphbaph/article/1896538021081583882, Posted on X, March 3,
2025.
Strnad, Jeff (2024) “Economic DAO Governance: A Contestable Control Ap-
proach,” https://arxiv.org/abs/2403.16980, Version 4, December 25,
2024.
(2025) “Economic DAO Governance: A Contestable Control Ap-
proach,” Blockchain: Research and Applications , forthcoming.
74

---
