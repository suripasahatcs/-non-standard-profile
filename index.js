const fs = require('fs')
  , nodemailer = require('nodemailer')
  , path = require('path')
  , showdown = require('showdown')
  , glob = require('glob')
  , core = require('@actions/core')
  , io = require('@actions/io')
  , OrganizationActivity = require('./src/githublib/OrgsUserActivity')
  , githubClient = require('./src/githublib/githubClient')
  
  , OrgsssActivity = require('./src/githublib/api')
;

async function run() {
  const token = getRequiredInput('token')
    , outputDir = getRequiredInput('outputDir')
    , organizationinp = getRequiredInput('organization')
    , maxRetries = getRequiredInput('octokit_max_retries')
  ;


  let regex = /^[\w\.\_\-]+((,|-)[\w\.\_\-]+)*[\w\.\_\-]+$/g;
  let validate_org = regex.test(organizationinp);
  if((!validate_org)) {
    throw new Error('Provide a valid organization - It accept only comma separated value');
  }
  
  // Ensure that the output directory exists before we our limited API usage
  await io.mkdirP(outputDir)

  const octokit = githubClient.create(token, maxRetries)
    , orgActivity = new OrganizationActivity(octokit)
  ;

  //***start */
  let organizationlist = organizationinp.split(',');
  let removeMulUserList = [];
  let jsonfinallist = [];
  let rmvconfrm = 0;
  for(const organization of organizationlist){
    console.log(`Attempting to generate ${organization} - user activity data, this could take some time...`);
    const orgsComments = await orgActivity.getOrgsValid(organization);
    console.log(orgsComments)
    if(orgsComments.status !== 'error') {
      jsonfinallist = await orgActivity.getUserActivity(organization);
      
    }
  }

  // console.log('******output*******')
  // console.log(removeMulUserList);
  console.log('******final*******')
  console.log(jsonfinallist);
  
  
  //***end test */

  console.log(`User activity data captured, generating inactive user report... `);

 
  const totalInactive = jsonfinallist.length;

  core.setOutput('jsonfinallist', jsonfinallist);
  core.setOutput('usercount', totalInactive);
  if(totalInactive === totalInactive){
    core.setOutput('message', 'Success');
  }else{
    core.setOutput('message', 'Failure');
  }
}

async function execute() {
  try {
    await run();
  } catch (err) {
    core.setFailed(err.message);
  }
}
execute();


function getRequiredInput(name) {
  return core.getInput(name, {required: true});
}



function saveIntermediateData(directory, data) {
  try {
    const file = path.join(directory, 'jsonfinallist.json');
    fs.writeFileSync(file, JSON.stringify(data));
    core.setOutput('jsonfinallist_json', file);
  } catch (err) {
    console.error(`Failed to save intermediate data: ${err}`);
  }
}

// Sending mail to non standard users

function getBody(bodyOrFile, convertMarkdown) {
  let body = bodyOrFile

  // Read body from file
  if (bodyOrFile.startsWith("file://")) {
      const file = bodyOrFile.replace("file://", "")
      body = fs.readFileSync(file, "utf8")
  }

  // Convert Markdown to HTML
  if (convertMarkdown) {
      const converter = new showdown.Converter()
      body = converter.makeHtml(body)
  }

  return body
}

function getFrom(from, username) {
  if (from.match(/.+ <.+@.+>/)) {
      return from
  }

  return `"${from}" <${username}>`
}


async function getAttachments(attachments) {
  const globber = await glob.create(attachments.split(',').join('\n'))
  const files = await globber.glob()
  return files.map(f => ({ path: f, cid: f.replace(/^.*[\\\/]/, '')}))
}
async function main() {
  try {
      const serverAddress = core.getInput("server_address", { required: false })
      const serverPort = core.getInput("server_port", { required: false })
      const username = core.getInput("username")
      const password = core.getInput("password")
      const subject = core.getInput("subject", { required: false })
      const from = core.getInput("from", { required: false })
      const to = core.getInput("to", { required: false })
      const secure = core.getInput("secure", { required: false })
      const body = core.getInput("body", { required: false })
      const htmlBody = core.getInput("html_body", { required: false })
      const cc = core.getInput("cc", { required: false })
      const bcc = core.getInput("bcc", { required: false })
      const replyTo = core.getInput("reply_to", { required: false })
      const inReplyTo = core.getInput("in_reply_to", { required: false })
      const attachments = core.getInput("attachments", { required: false })
      const convertMarkdown = core.getInput("convert_markdown", { required: false })
      const ignoreCert = core.getInput("ignore_cert", { required: false })
      const priority = core.getInput("priority", { required: false })
      
      if (!username || !password) {
          core.warning("Username and password not specified. You should only do this if you are using a self-hosted runner to access an on-premise mail server.")
      }

      const transport = nodemailer.createTransport({
          host: serverAddress,
          auth: username && password ? {
              user: username,
              pass: password
          } : undefined,
          port: serverPort,
          secure: secure == "true" ? true : serverPort == "465",
          tls: ignoreCert == "true" ? {
              rejectUnauthorized: false
          } : undefined,
      })


      console.log(to.split(','))
      let emaillist = to.split(',');
      for (let x in emaillist) {
          if (emaillist[x].match(/@gmail.com/)) {
              // console.log("sucss mail-id "+ emaillist[x])
              const info = await transport.sendMail({
                  from: getFrom(from, username),
                  to: emaillist[x],
                  subject: subject,
                  cc: cc ? cc : undefined,
                  bcc: bcc ? bcc : undefined,
                  replyTo: replyTo ? replyTo : undefined,
                  inReplyTo: inReplyTo ? inReplyTo : undefined,
                  references: inReplyTo ? inReplyTo : undefined,
                  text: body ? getBody(body, false) : undefined,
                  html: htmlBody ? getBody(htmlBody, convertMarkdown) : undefined,
                  priority: priority ? priority : undefined,
                  attachments: attachments ? (await getAttachments(attachments)) : undefined,
              })
          }
          else {
              console.log("error mail-id "+ emaillist[x])
          }
      }
  } catch (error) {
      core.setFailed(error.message)
  }
}

main()