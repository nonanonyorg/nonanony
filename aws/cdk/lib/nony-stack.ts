import {RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import {FunctionEventType, SigningBehavior, SigningProtocol} from 'aws-cdk-lib/aws-cloudfront';
import {S3BucketOrigin} from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import {Certificate} from "aws-cdk-lib/aws-certificatemanager";

export interface MainAppStackProps extends StackProps {
    certificateArn: string;
}

export class NonyStack extends Stack {
    constructor(scope: Construct, id: string, props?: MainAppStackProps) {
        super(scope, id, props);

        const nonyBucket = new s3.Bucket(this, 'NonyBucket', {
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
            versioned: true,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true
        });

        const nonyOAC = new cloudfront.S3OriginAccessControl(this, 'NonyOAC', {
            originAccessControlName: 'NonyBucketOAC',
            signing: {
                protocol: SigningProtocol.SIGV4,
                behavior: SigningBehavior.ALWAYS,
            },
        });

        const rewriteFunction = new cloudfront.Function(this, 'RewriteFunction', {
            code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  if (!request.uri.endsWith('/')) {
    request.uri += '/';
  }
  request.uri += 'index.html';
  return request;
}
            `)
        })

        const distribution = new cloudfront.Distribution(this, 'SecureDist', {
            defaultBehavior: {
                origin: S3BucketOrigin.withOriginAccessControl(nonyBucket, {
                    originAccessControl: nonyOAC,
                }),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                functionAssociations: [{
                    eventType: FunctionEventType.VIEWER_REQUEST,
                    function: rewriteFunction
                }]
            },
            domainNames: ['nony.io'],
            certificate: Certificate.fromCertificateArn(this, 'NonyCert', props?.certificateArn!),
            minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
            httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
            enableLogging: true,
            logBucket: new s3.Bucket(this, 'LogBucket', {
                removalPolicy: RemovalPolicy.DESTROY,
                autoDeleteObjects: true,
                encryption: s3.BucketEncryption.S3_MANAGED,
                enforceSSL: true,
                objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,  // 👈 required
                accessControl: s3.BucketAccessControl.LOG_DELIVERY_WRITE // 👈 allow ACL-based log writes
            }),
            logFilePrefix: 'cf-logs/'
        });

        nonyBucket.addToResourcePolicy(new iam.PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [nonyBucket.arnForObjects('*')],
            principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
            conditions: {
                StringEquals: {
                    'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`
                }
            }
        }));

    }
}
