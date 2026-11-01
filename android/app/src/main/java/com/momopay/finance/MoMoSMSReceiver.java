package com.momopay.finance;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

public class MoMoSMSReceiver extends BroadcastReceiver {
    private static final String TAG = "MoMoSMSReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !"android.provider.Telephony.SMS_RECEIVED".equals(intent.getAction())) {
            return;
        }

        Bundle bundle = intent.getExtras();
        if (bundle == null) return;

        try {
            Object[] pdus = (Object[]) bundle.get("pdus");
            String format = bundle.getString("format");

            if (pdus == null || pdus.length == 0) return;

            StringBuilder fullMessage = new StringBuilder();
            String sender = "";

            for (Object pdu : pdus) {
                SmsMessage sms;
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                    sms = SmsMessage.createFromPdu((byte[]) pdu, format);
                } else {
                    sms = SmsMessage.createFromPdu((byte[]) pdu);
                }

                if (sms != null) {
                    sender = sms.getDisplayOriginatingAddress();
                    fullMessage.append(sms.getMessageBody());
                }
            }

            String body = fullMessage.toString();
            Log.d(TAG, "SMS received from: " + sender + " content: " + body);

            // Filter for Mobile Money notifications (MTN MoMo, Airtel, or financial transaction SMS)
            String lower = body.toLowerCase();
            boolean isMoMo = lower.contains("rwf") || 
                             lower.contains("txid") || 
                             lower.contains("transaction id") || 
                             lower.contains("payment") || 
                             lower.contains("kwishyura") || 
                             lower.contains("byarangiye") || 
                             lower.contains("mwakiriye") || 
                             lower.contains("balance") || 
                             sender.toLowerCase().contains("momo") || 
                             sender.toLowerCase().contains("money");

            if (isMoMo) {
                MainActivity.dispatchMoMoSMS(sender, body);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error parsing incoming SMS: " + e.getMessage(), e);
        }
    }
}
