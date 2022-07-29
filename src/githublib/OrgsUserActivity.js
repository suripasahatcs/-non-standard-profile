const Organization = require('./api');
module.exports = class OrganizationUserActivity {

  constructor(octokit) {
    this._organization = new Organization(octokit);
  }

  get organizationClient() {
    return this._organization;
  }
  get removeUserClient(){
    return this._removeUser;
  }

  // Delete function of users-
  getRemoveUserFrom(org, user){
    return this.octokit,paginate("DELETE /orgs/:org/members/:user",
    {
      org: org,
      user: user
    }
  ).then(members => {
    return {
      status: 'success',
      message: `${members} -users removed from organization`
    }
  })
}


  async getUserActivity(org) {
    const self = this;

    const orgUsers = await self.organizationClient.findUsers(org);
    
    let activityResults = [];
    let nonstduserlogin = [];
    let nonstduseremail = [];
    let nonstduserattribute = [];
    let repoActivity = [];
    let finalres =[];
    
    //   repoActivity2 = await self.organizationClient.findNonstdUsers(orgUsers[1]['login']);
    //   console.log(repoActivity1)
    //   console.log(repoActivity2)

    for(let idx = 0; idx< orgUsers.length; idx++) 
    {
      repoActivity = [];
      repoActivity = await self.organizationClient.findNonstdUsers(orgUsers[idx]['login']);
      //nonstduseremail.push(orgUsers[idx]['node_id'])
      
      console.log('******repoActivityLength*******')
      
           console.log('******repoActivity*******')
         console.log(repoActivity)
         let j = 0;
         console.log(repoActivity[j]['public_repos'])
          console.log('*****************')
          if(repoActivity[j]['company'] !== 'TCS')
          {
           
            nonstduserattribute.push('company');
            //nonstduserlogin.push(repoActivity[j]['login'])
            

          }
          if( (repoActivity[j]['email'] == null) )
          {
            nonstduserattribute.push('email');
            //nonstduserlogin.push(repoActivity[j]['login'])
          }
        
          if(repoActivity[j]['public_repos'] > 0)
          {
            nonstduserattribute.push('public_repos');
            //nonstduserlogin.push(repoActivity[j]['login'])
          }
          let loginregex = /^([A-Z0-9]{11})\d$/;
           let validate_login = loginregex.test(repoActivity[j]['login']);
           console.log('******validatelogin*******')
           console.log(validate_login)
           if((!validate_login)){

            nonstduserattribute.push('login')
           }
           if((repoActivity[j]['company'] !== 'TCS') || (repoActivity[j]['email'] == null) || (repoActivity[j]['public_repos'] > 0))
           {
            nonstduserlogin.push(repoActivity[j]['login'])
           }
         
          
           console.log('******attribute*******')
           console.log(nonstduserattribute)

        repoActivity = [...repoActivity,{nonstduser:nonstduserattribute, message: 'non std user'}];
        
        
      

         finalres.push(repoActivity)
                
                console.log('******non std2*******')
                 console.log(repoActivity)
            //Empty the nonstduserattribute array.
                nonstduserattribute = [];
                nonstduserattribute.length = 0;
               // nonstduserlogin = [];
                //nonstduserlogin.length = 0;
                //  console.log('******login*******')
                //  console.log(nonstduserlogin)
                //  console.log('******publicrepos*******')
                //  console.log(nonstduserattribute)

        

               // activityResults =[  activityResults, ...nonstduseremail];
          
    }
    console.log('******non std*******')
           console.log(nonstduserlogin)
    console.log('******attribute*******')
    console.log(nonstduserattribute)
    console.log('******final*******')
    console.log(finalres)
   
    // An array of user activity objects
    return Object.values(finalres);
    
  }

   async getOrgsValid (org) {
    const self = this;
    const orgsValid = await self.organizationClient.getOrgs(org);

    return orgsValid;
    
  }
}

function generateUserActivityData(data) {
  if (!data) {
    return null
  }

  // Use an object to ensure unique user to activity based on user key
  const results = {};

  function process(repo, values, activityType) {
    if (values) {
      Object.keys(values).forEach(login => {
        if (!results[login]) {
          results[login] = new UserActivity(login);
        }

        results[login].increment(activityType, repo, values[login]);
      })
    }
  }

  Object.keys(data).forEach(repo => {
    const activity = data[repo];
    Object.keys(activity).forEach(activityType => {
      process(repo, activity[activityType], activityType)
    });
  });

  return results;
}
