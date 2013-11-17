GraphicExpenditure
==================
<h3>Introduction</h3>
<p>GraphicExpenditure is a data persistent and presentation application that meants to help people effectively understand 
their expense. GraphicExpenditure has two main tasks. The first one is to provide users a flexible way to access their 
expenditure that stored in the Dropbox cloud. With a Dropbox account in hand, users can access heir personal data anywhere 
from any devices.</p>

<p>Another core function of GraphicExpenditure is to present these data in abundant graphs from different angles. Users can 
define their spendings with different tags. Therefore, not only the total spending but also data in different categories 
can be displayed. In next phases, predection features will also be added so that users can smartly plan the future 
spending.</p>

<h3>What technologies are used</h3>
<p>
<div>GraphicExpenditure is a pure web application which takes use of Dropbox as a static web server. This means that there
is no "server side" code and all the code is written in JavaScript, HTML and CSS. In addition, GraphicExpenditure also 
takes advantage of below open source libraries so far:</div>
<div><a href="http://d3js.org/">D3</a></div>
<div><a href="https://www.dropbox.com/developers/datastore">Dropbox Datastore API</a></div>
</p>

<h3>How to run GraphicExpenditure</h3>
<p>
<div>
Since the application is hosted by dropbox, the premise of using GraphicExpenditure is to have a Dropbox account before 
any coding and testing. After register and sign in Dropbox, follow below steps to make GraphicExpenditure run:</div>
<ul>
<li>Create a folder under your Public folder of Dropbox</li>
<li>Copy all the files of this application to the new folder</li>
<li>Right click the application's main page (Graphic.html) and select "copy public link"</li>
<li>Change the resource reference in head part of Graphic.html</li>
<li>Paste the link to your browser (Chrome preferred) to run GraphicExpenditure</li>
</ul>
</p>
