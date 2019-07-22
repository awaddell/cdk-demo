# A Demo AWS CDK app

## Intro

The AWS CDK has just gone GA and, in order to demo standing up a 3-tier architecture in AWS, what better way than to write infrastructure-as-code in real code with, in my case, Typescript.

What I like about the CDK is that it produces Cloudformation templates for consumption by the AWS CFN service. Furthermore, it provides a more detailed preview than CFN's own change-sets.

What the CDK does is nothing new, for instance [Troposphere](https://github.com/cloudtools/troposphere) provided functionality in the same way as long ago as 2013

Terraform is another Infrastructure-as-code tool which has the benefit of supporting multiple clouds (and more!).

However, Terraform assumes responsibility for state management whereas, Cloudformation and anything producing Cloudformation templates defer to the AWS service for state management. Terraform is also a DSL rather than a complete language.

The CDK seems like it will grow in popularity because:

- it speaks to a 'lego bricks' capability where a team can assemble components from the community or develop in-house and (in time) get the benefit of re-use
- it supports multiple languages (TypeScript, JavaScript, and Python  and in Preview, C#/.NET, and Java)
- it's new and shiny (but not really - see Troposhere)

I wanted to see how things would go straight-off-the-bat and I'll provide a summary at the end.

## Prerequisites:

- [Install node and npm](https://nodejs.org/en/download/)
- [install the CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html) and ensure you have an AWS profile referenced in the command-line or the environment
- export the AWS Region for AMI selection
- install local dependencies from package.json 

## I've only provided an AMI for us-east-1

The method uses a map and the map needs to know which region I really want and so we need to export the region for consumption by the app

```
export AWS_DEFAULT_REGION=us-east-1
```

If you want to use exports instead if --profile then now is the time to also export your keys

NB I didn't test this case.

```
export AWS_ACCESS_KEY_ID=XXXXX
export AWS_SECRET_KEY=ZZZZZZ
```

## Install local dependencies from package.json 

Clone this repo, cd cdk-demo and run

```
npm install
```

## Workflow for synth, diff and deploy


### Run the build before first run and anytime a TypeScript file is changed

```
npm run build
```

### cdk synth for inspecting the CFN output

While not a part of regular workflow, this can be invaluable for verifying the CFN boilerplate priot to deployment (see also cfn diff)

```
cdk --profile=<aws profile> synth
```

Or for JSON

```
cdk --profile=<aws profile> synth -j
```

If you have jq (homebrew: 'brew install jq') installed or want to install it, then you can prettify the output

```
cdk --profile=<aws profile> synth -j | jq .
```

And manipulate it for inspection. eg:

```
cdk  --profile=<aws profile> synth -j | jq ".[].CDKMetadata"
```

## Deploying


### First run

For the first run, we can run deploy with:

```
cdk --profile=<aws profile> deploy
```

#### After this, you'll need to jump into the console and fetch the ELB DNS name. Then connect on port 80 to verify. 


### Subsequent runs

```
< make some change >
npm run build
cdk --profile=<aws profile> diff
cdk --profile=<aws profile> deploy
```

### Destroying the stack

```
cdk --profile=<aws profile> destroy
```


## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template


## Links

- https://kevinslin.com/aws/cdk_all_the_things/#updating-a-service
- https://docs.aws.amazon.com/cdk/api/latest/docs/aws-ec2-readme.html
- https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html


## Summary

I ran into blocker after blocker. 

1. The CDK could not recognise my AWS profile which uses SwithRole to delegate access key and secret key. This seems like an issue raised before and fixed but I also have MFA in the profile so maybe that was the problem.

2. I'm creating a conventional 3-tier hierarchy with Public, Private and Protected subnets. CDK has built some 'friendly' opinionated constructs around the Private subnets which is to say, it deploys a NAT Gateway for any Private subnet. Well, I specifically don't want a NAT GW. My instances will be immutable - a poor man's Docker - so they won't need to do eg yum updates. Any services I need (eg NTP) I can deploy in the Public subnets. This particular case blew out the project and I ended up calling the Private subnet 'ISOLATED' (why not 'PROTECTED' ???) so save from becoming a node guru in less than a day.

3. When I next deployed an ASG, **that failed too** because, it turns out CDK in its opinionated way, only wants to deploy an ASG to subnets tagged as 'PRIVATE'. At this point, I had to decide if I wanted to fix issue #2 or, as I ended up doing, find a somewhat faster fix for #3. This was fixed via the props 'vpcSubnets: {subnetName: 'Application'},'

4. What made everything harder was, that for any problem, I'd be lucky to find even a vaguely related previous example. I didn't find any examples for my exact use-case so had a very vertical path into using Typescript (which I, masochistically, wanted anyway)

The takeaway is that the CDK isn't going to be a magic bullet for creating re-usable infra code from 'lego bricks'. Most will be community provided (oh, did I mention that the CDK itself is still very early days having just gone GA this month) and some will need both advanced programming skills in the language of choice, and a solid understanding of AWS Resource Types. 

For all that, in a couple of years, I'm sure it will be a Thing for those that want to be all-in-with-aws. At that time, those who've invested will be reaping the benefits of re-usable ifnra that's written in code rather than in some markup language (like, Yet Another Markup Language).


## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template


