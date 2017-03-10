// ==UserScript==
// @name          MTurk HIT Export to Facebook
// @namespace     https://mturkers.org/adaaaam
// @description   Export MTurk HIT information to post on Facebook
// @version       2017.03.10.2
// @author        adaaaam
// @include       https://www.mturk.com/mturk/*searchbar*
// @include       https://www.mturk.com/mturk/findhits*
// @include       https://www.mturk.com/mturk/viewhits*
// @include       https://www.mturk.com/mturk/sorthits*
// @include       https://www.mturk.com/mturk/myhits*
// @exclude       https://www.mturk.com/mturk/*selectedSearchType=quals*
// @grant         GM_setClipboard
// @grant         GM_notification
// ==/UserScript==

document.head.appendChild(document.createElement('style')).innerHTML = ".fbButton { margin-left:3px; valign:center; color:white; border:0px; font-size: 8px; height: 14px; width: 22px; padding: 0px; background: #4267b2; }";

var capsules = document.getElementsByClassName('capsulelink');
for (var i = 0; i < capsules.length / 2; i++) {
    fbButton = document.createElement('button');
    fbButton.classList.add("fbButton");
    fbButton.textContent = 'FB';
    fbButton.title = 'Click to copy HIT information formatted for Facebook';
    fbButton.addEventListener("click", exportFB, false);
    fbButton.setAttribute("place", i);
    document.getElementById('capsule'+i+'-0').parentNode.appendChild(fbButton);  // Append button to HIT title
}

function getTO(id) {
    var toURL = 'https://turkopticon.ucsd.edu/api/multi-attrs.php?ids='+id;
    requestTO = new XMLHttpRequest();
    requestTO.onreadystatechange = function () {
        if ((requestTO.readyState ===4) && (requestTO.status ===200)) {
            if (requestTO.responseText.split(':').length < 3) rated = false;
            else rated = true;
        }
    };
    requestTO.open('GET', toURL, false);
    requestTO.send(null);
}

function exportFB(a) {
    var theButton = a.target;
    var capTitle = document.getElementById('capsule'+theButton.getAttribute("place")+'-0');
    var hitTitle = capTitle.textContent.trim();
    var tBodies = capTitle.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
    var requesterID = tBodies.getElementsByClassName('requesterIdentity')[0].parentNode.href.split('requesterId=')[1];
    var groupID = capTitle.parentNode.parentNode.getElementsByClassName('capsulelink')[1].firstChild.nextSibling.href.split('=')[1];
    var hitReward = tBodies.getElementsByClassName('reward')[0].textContent;
    var hitsAvailable = tBodies.getElementsByClassName('capsule_field_text')[4].textContent;
    hitsAvailable = hitsAvailable.replace(new RegExp("[^0-9]", "g"), "");
    var qualList = document.getElementById('capsule'+theButton.getAttribute("place")+'target').getElementsByTagName('tbody')[2];
    var qualColl = qualList.getElementsByTagName('td');
    var masters = '';
    for ( var m = 3; m < qualColl.length; m++ ) if ( qualColl[m].textContent.indexOf('Masters') > -1 ) masters = 'Masters, ';
    var hitURL = 'https://www.mturk.com/mturk/preview?groupId=' + groupID;
    var to = getTO(requesterID);
    if (!rated) rated = ", no TO";
    else rated = "";
    var fbExport = hitTitle + ' ' + hitURL + '\n\n' + masters + hitReward + ' x ' + hitsAvailable + ' available' + rated + '\n\n';
    GM_setClipboard(fbExport);
    var hitDetails = {
        text: hitTitle + ' ' + '\n\n' + masters + hitReward + ' x ' + hitsAvailable + ' available' + rated,
        title: 'MTurk HIT Details Copied',
        timeout: 25000,
        onclick: function() { window.open('https://www.facebook.com/groups/mturkers'); },
    };
    GM_notification(hitDetails);
}