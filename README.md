# AWS Profile Selector
This project designed to prevent AWS profile switching manually via configuration file modification.

This App can do user to register, modify, delete, and switch profiles via the UI.


## How to use

1. [Releases](https://github.com/pleming/aws-profile-selector/releases)
    * Release Files
      ```
      (1) Windows_x64 (Portable) : aws-profile-selector_${VERSION}.exe
      (2) Linux_x64 (Install) : aws-profile-selector_${VERSION}_amd64.deb
      (3) Linux_x64 (Portable) : aws-profile-selector_${VERSION}_tar.gz
      ```
   

2. Install App/Execute App
    * Windows (Portable)
      ```
      Execute [aws-profile-selector-${VERSION}.exe]
      ```
      
    * Ubuntu (Install & Execute)
      ```
      # sudo dpkg -i aws-profile-selector_${VERSION}_amd64.deb
      
      * Reference
      # /opt/aws-profile-selector/aws-profile-selector => Installed file location
      # /usr/share/applications/aws-profile-selector.desktop => Shortcut location
      ```
      
    * Ubuntu (Portable)
      ```
      # mkdir aws-profile-selector
      # mv aws-profile-selector_${VERSION}.tar.gz aws-profile-selector
      # cd aws-profile-selector
      # tar xvfz aws-profile-selector_${VERSION}.tar.gz
      # ./aws-profile-selector
      ```


3. Agreement of terms and conditions
    * Process for agreement
      ```
      When you run the app, you have to read AGREEMENT and switch button the switch to ON to use it.
      ```


4. Synchronize existing AWS profile configuration
    * Constraint
      ```
      (1) Synchronization is not possible because the user does not know how to define the content of config/credentials.
      (2) So, the App decided to manage its DB. Please register the profile once at first.
      ```
   
   
5. Register new profile
    * Show [New profile] modal
      ```
      Press the [+] button on the screen to show [New profile] modal.
      ```
    * Enter required information
      ```
      The following 4 items are required items.
      
      (1) Profile name
      (2) Region
      (3) Access key ID
      (4) Access key
      
      If you do not enter it, New profile process is denied.
      ```
    * If you are using MFA...
      ```
      Press the MFA switch to activate and enter your MFA ARN
      ```
      

6. Modify profile
    * Show [Modify profile] modal
      ```
      If you look to the right of the generated profile button, there is a dropdown menu.
      
      (1) Press the dropdown button
      (2) Press the [Modify] button
      
      The modal that can be modified appears. You are free to modify in this modal.
      ```
      

7. Delete profile
    * Press [Delete] button
      ```
      If you look to the right of the generated profile button, there is a dropdown menu.
      
      (1) Press the dropdown button
      (2) Press the [Delete] button
      
      If you enter the profile name so as not to delete it by mistake, it is deleted.
      ```
      

8. Apply AWS profile
    * Press profile button
      ```
      If you simply press the Profile button, the profile is switched after confirming the your intention.
      ```

    * If you are using MFA...
      ```
      OTP modal appears additionally. Enter OTP.
      It takes some time to check OTP by communicating with AWS.
      The Loading screen appears, and when it ends, it is applied in your configuration and Switched your profile.
      The validity period is 12 hours, and the remaining time is displayed.
      ```


9. Save/Load
    * As mentioned earlier, this App manages its own DB.
    * Therefore, You will need the function to save and load for configuration.
    * Process for save
      ```
      (1) Choose one of the following two methods.
          * Press the [File => Save As] button on the top menu bar.
          * Execute the [Ctrl + S] accelerator.
      
      (2) Save the configuration
          * It uses its own extension called APSC, but it is a simple JSON file. developer did not process the binary. This i s to freely modify the configuration in JSON form and import/export.
      
      (3) APSC extension format (reference) 
          {
              "profile_01": {
                  "region": "ap-northeast-1",
                  "aws_access_key_id": "ACCESS_KEY",
                  "aws_secret_access_key": "SECRET"
              },
              "profile_02": {
                  "region": "ap-northeast-2",
                  "aws_access_key_id": "ACCESS_KEY_02",
                  "aws_secret_access_key": "SECRET_02",
                  "mfa_arn": "arn:aws:iam::1234567890:mfa/mfa.arn.aws.iam_p"
              }
          }
      ```
    * Process for load
      ```
      (1) Load files written with the same rules in the APSC extension.
          * Press the [File => Load] button on the top menu bar.
          * Execute the [Ctrl + O] accelerator.
      
      (2) Load the configuration
          * All configurations are reset and initialized to the loaded file.
      ```
      

10. Raise the issues
    * If issues occur while using the App, Contact the developer
      ```
      Developers and Contacts are written in the following locations.
      => [Menu => Help => About]
      ```
