#!/opt/homebrew/opt/node/bin/node
import * as cdk from 'aws-cdk-lib';
import {NonyStack} from '../lib/nony-stack';
import {CertStack} from "../lib/cert-stack";

const app = new cdk.App();

const certStack = new CertStack(app, 'CertStack', {
    env: {region: 'us-east-1'},
    crossRegionReferences: true,
});

new NonyStack(app, 'NonyStack', {
    env: {region: 'us-west-2'},
    certificateArn: certStack.certArn,
    crossRegionReferences: true,
});