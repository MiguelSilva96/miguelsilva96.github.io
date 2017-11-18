/*
	Author: Miguel Silva
	Version: 1.0
	Repository: https://www.github.com/miguelsilva96/miguelsilva96.github.io
	
	Description: This files uses the github api 
	to get activity info about a certain user
	and treat it to display on a web page.
*/

'use strict'

class GithubActivity {

	constructor(username) {
		this.username = username;
		this.apiUrl = 'https://api.github.com/users/';
	}

	request(action, url, func) {
		var request = new XMLHttpRequest();
		
		request.open(action, url);
		request.onload= () => {
			if(request.readyState == 4 && request.status == 200) {
				try {
					var arr = JSON.parse(request.response);
					func(arr, this);
				} catch(err) {
					console.log(err.message);
				}
			} 
		};
		request.send();
	}

	treatUser(info, context) {
		var followers = info.followers;
		var following = info.following;
		var publRepos = info.public_repos;
		var txt = followers+' Followers, '+
				  following+' Following & '+
				  publRepos+' Public Repositories ';

		var topInfo = document.getElementById("topGithub")
		var netInfo = document.createElement("P");
		var text    = document.createTextNode(txt);

		netInfo.appendChild(text);
		topInfo.appendChild(netInfo);
		netInfo.className = 'text-githubInfo';

		var avtr = document.getElementById("gitHubAvatar");
		var link = document.getElementById("gitHubLink");
		link.href = info.html_url;
		link.text = info.login;
		avtr.src  = info.avatar_url;
	}

	treatEvents(info, context) {
		var num = 5, pos = 0;
		var limit = info.length - 1;
		if(limit < 0) context.noEvents();
		while(pos <= limit && num > 0) {
			switch(info[pos].type) {
				case 'PushEvent':
					let branch = context.getBranchName(info[pos]);
					let div = context.treatSingleEvent(info[pos],
						'octicon-repo-push',
						' pushed to '+branch+' at ');
					context.completePushEvent(info[pos].payload, div);
					num--;
					break;
				case 'ForkEvent':
					context.treatSingleEvent(info[pos],
						'octicon-repo-forked',
						' forked ');
					num--;
					break;
				case 'WatchEvent':
					context.treatSingleEvent(info[pos], 
						'octicon-star',
						' starred ');
					num--;
					break;
			}
			pos++;
		}
	}

	noEvents() {
		var eventInfo = document.getElementById("git-lines");
		var lineInfo  = document.createElement("DIV");
		var eventDes  = document.createElement("P");
		var text = document.createTextNode("Sorry, no recent events");
		var icon = document.createElement("I");

		eventDes.appendChild(text);
		lineInfo.appendChild(icon);
		lineInfo.appendChild(eventDes);
		eventInfo.appendChild(lineInfo);
		lineInfo.className = 'line';
		icon.className = 'octicon myicon text-githubInfo octicon-octoface';
	}

	treatSingleEvent(info, ico, msg) {
		var githubUrl = "https://github.com/";
		var actor = info.actor.login, repo = info.repo.name;
		var html = [];
		var eventInfo = document.getElementById("git-lines");
		var lineInfo = document.createElement("DIV");
		//Maybe use here date or smth
		var eventDes = document.createElement("P");
		var icon = document.createElement("I");
		
		html.push(
			"<a href='",
			githubUrl, actor, "'>",
			actor, "</a>", msg,
			"<a href='", githubUrl,
			repo, "'>", repo, "</a>"
		);

		eventDes.innerHTML = html.join("");
		lineInfo.appendChild(icon);
		lineInfo.appendChild(eventDes);
		eventInfo.appendChild(lineInfo);
		lineInfo.className = 'line';
		icon.className = 'octicon myicon text-githubInfo ' + ico;
		//To add anything if needed on some events
		//For example add push message on pushevents
		return lineInfo;
	}

	completePushEvent(info, div) {
		var commits = info.commits;
		var l = commits.length;
		for(var i = 0; i < l; i++) {
			let par = document.createElement("span");
			let ava = document.createElement("IMG");
			ava.src = 'https://avatars.githubusercontent.com/'
					+commits[i].author.name;
			let commitMsg = commits[i].message;
			if(commitMsg.length > 50) {
				commitMsg = commitMsg.substring(0,50);
				commitMsg = commitMsg + "...";
			}
			commitMsg = commitMsg + "  ";
			let msg = document.createTextNode(commitMsg);
			par.appendChild(ava);
			par.appendChild(msg);
			div.appendChild(par);
			par.className = 'text-githubInfo';
			ava.className = 'commit-img';
			par.setAttribute("margin-left", "50px");
		}
	}

	getBranchName(info) {
		return info.payload.ref.split("/")[2];
	}

	processUserInfo() {
		this.request('GET', 
					this.apiUrl+this.username, 
					this.treatUser);
	}

	processEvents() {
		this.request('GET', 
					this.apiUrl+this.username+'/events', 
					this.treatEvents);
	}
}

var git = new GithubActivity('miguelsilva96');
git.processUserInfo();
git.processEvents();