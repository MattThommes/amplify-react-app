# ⛅️ ⚛︎ Amplify React App: 🛠️ Developer Guide

## Cloud Resources: Images

### Syncing local images to S3

```
$ aws s3 sync ~/Documents/dev/[PROJECT]/images/ s3://[BUCKET_NAME] --acl public-read
```

There should be a shortcut in package.json also:

```
$ npm run image-sync
```

The `images` folder is just a placeholder for syncing purposes. It is not meant to hold every single image. Once an image is synced to the cloud you can delete the file locally. `.gitignore` already has a rule to ignore the root level `/images/` directory.

### Example image usage in code

```
<img className="img-fluid" src="https://[BUCKET_NAME].s3.amazonaws.com/[FILENAME].jpg" />
```

Resize your image dimensions to be around 800-1000px width. The image will automatically be resized to fit the container it is in, but it is better obviously to have the image already sized correctly to reduce the file size.

### Adding image storage for the first time

1. `amplify add storage`
2. Choose `Content (Images, audio, video, etc.)`
3. Enter `y` when asked to add auth (Amazon Cognito)
4. Choose `Default configuration`
5. Choose `Email` when asked `How do you want users to be able to sign in?`
6. Enter a short custom identifier string for `Provide a friendly name for your resource`
7. You can leave the default bucket name as it is already unique - just hit Enter.
8. For `Who should have access` choose `Auth users only`
9. For `What kind of access do you want for Authenticated users?` select all options using the spacebar.
10. Enter `n` for `Do you want to add a Lambda Trigger for your S3 Bucket?`
11. Log into the AWS console and go to the S3 section.
12. Verify the number of buckets you have - once you push the changes you should see a new bucket created.
13. Run `amplify push` to push the local storage changes to the cloud.
14. Verify in AWS console you see the new bucket created, something like `thommesfamvacationsaf92c0e5c7194a05804f41a082b0110057-dev`
    1. You can also run `aws s3 ls` locally to see your buckets.
