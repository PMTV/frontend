EmergeApp.config(function ($translateProvider) {
    $translateProvider.translations('en', {
        'GREETING': 'Hello',
        'GREET_TO': 'Hey welcome {{name}}! If you\'re new to Emerge, you can view our tutorial (coming soon).',
        'ALERT': {
            'SAVING': 'Yikes, the data is still saving, please wait',
            'SAVED': 'It has been successfully saved',
            'CREATED': 'It has been successfully added',
            'UPDATED': 'It has been successfully updated',
            'CANCELLING': 'Do you want to proceed to cancel?',
            'CANCELLED': 'It has been successfully cancelled',
            'DELETING': 'Do you want to proceed to delete?',
            'DELETED': 'It has been successfully deleted',
            'SENT': 'It has been successfully sent',
            'DUPLICATING': 'Do you want to copy this?',
            'DUPLICATED': 'It has been successfully copied',
            'CONVERTING': 'Do you want to proceed to convert?',
            'CONVERTED': 'It has been successfully converted',
            'UPLOADING': 'Yikes, the data is still being uploaded, please wait',
            'UPLOADED': 'It has been successfully uploaded',
            'FORM_ERROR': 'To Proceed, please fill up the necessary fields',
            'NOT_FOUND': 'Yikes, item could not be found',
            'NOT_FOUND_TYPE': 'Yikes, {{value}} could not be found', // $translate.instant('ALERT.NOT_FOUND_TYPE', { value: 'Customer' });
            'PLEASE_SELECT_TYPE': 'Please select {{type}} to proceed',
            'APPROVAL_SEND': 'Do you want to proceed to send for Approval?',
            'APPROVAL_APPROVING': 'Do you want to proceed to approve?',
            'APPROVAL_APPROVED': 'It has been sucessfully approved',
            'APPROVAL_REQUIRED': 'Approval is Required to proceed',
            'APPROVAL_RESEND': 'Saving will require this {{type}} to be sent for Re-Approval, proceed?',
        }
    });

    $translateProvider.preferredLanguage('en');
});