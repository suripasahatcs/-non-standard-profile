module.exports = class Organization {

    constructor(octokit) {
      if (!octokit) {
        throw new Error('An octokit client must be provided');
      }
      this._octokit = octokit;
    }

  
    getOrgs(org) {
      return this.octokit.paginate("GET /orgs/:org",
        {
          org: org
        }
      ).then(orgs => {
          console.log(`Searching ${org} organization`);
          const data =  {
            name: org,
            status: 'success'
          }
          return data;
        })
        .catch(err => {
          console.log(`Invalid name of Organization ===>> ${org} `)
          if (err.status === 404) {
              return {
                name: org,
                status: 'error'
              }
          } else {
            console.error(err)
            throw err;
          }
        })
    }
  
    findUsers(org) {
      return this.octokit.paginate("GET /orgs/:org/members", {org: org, per_page: 100})
        .then(members => {
          return members.map(member => {
            return {
              login: member.login,
              node_id: member.node_id || '',
              orgs: org
            };
          });
        });
    }
    
    findNonstdUsers(login) {
      return this.octokit.paginate("GET /users/:login", 
        {per_page: 100, login:login})
        .then(users => {
          return users.map(user => {
            return {
              login: user.login,
              name: user.name,
              email: user.email || null,
              company: user.company,
              public_repos: user.public_repos
              // non-std-fields = email,
	            // message: "Non standard values on key fields"
            };
          });
        });
    }
  
    get octokit() {
      return this._octokit;
    }
  }