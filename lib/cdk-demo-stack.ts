import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');

export class CdkDemoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const vpc = new ec2.Vpc(this, 'TheVPC', {
      cidr: '172.16.0.0/21',
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Ingress',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Application',
          subnetType: ec2.SubnetType.ISOLATED,
        },
        {
          cidrMask: 28,
          name: 'Database',
          subnetType: ec2.SubnetType.ISOLATED,
        }
      ]
    });
  }
}
