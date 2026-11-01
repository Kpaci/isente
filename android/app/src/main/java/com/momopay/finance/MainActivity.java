package com.momopay.finance;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import org.json.JSONObject;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    private static final int SMS_PERMISSION_REQUEST_CODE = 1001;
    private static MainActivity instance;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        instance = this;
        checkAndRequestSMSPermissions();
    }

    @Override
    protected void onResume() {
        super.onResume();
        instance = this;
    }

    public static MainActivity getInstance() {
        return instance;
    }

    /**
     * Request RECEIVE_SMS and READ_SMS permissions on launch or when triggered
     */
    public void checkAndRequestSMSPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            boolean hasReceiveSms = ContextCompat.checkSelfPermission(this, Manifest.permission.RECEIVE_SMS) == PackageManager.PERMISSION_GRANTED;
            boolean hasReadSms = ContextCompat.checkSelfPermission(this, Manifest.permission.READ_SMS) == PackageManager.PERMISSION_GRANTED;

            if (!hasReceiveSms || !hasReadSms) {
                ActivityCompat.requestPermissions(
                    this,
                    new String[]{Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS},
                    SMS_PERMISSION_REQUEST_CODE
                );
            }
        }
    }

    /**
     * Dispatch intercepted SMS event to Capacitor WebView
     */
    public static void dispatchMoMoSMS(String sender, String body) {
        try {
            if (instance != null && instance.getBridge() != null) {
                JSONObject payload = new JSONObject();
                payload.put("sender", sender != null ? sender : "");
                payload.put("message", body != null ? body : "");
                payload.put("timestamp", System.currentTimeMillis());

                instance.runOnUiThread(() -> {
                    try {
                        String eventData = payload.toString();
                        instance.getBridge().triggerJSEvent("momoSMSReceived", "window", eventData);
                        Log.d(TAG, "Successfully dispatched momoSMSReceived event to webview: " + eventData);
                    } catch (Exception err) {
                        Log.e(TAG, "Failed to trigger JS event: " + err.getMessage(), err);
                    }
                });
            }
        } catch (Exception e) {
            Log.e(TAG, "Error encoding SMS event payload: " + e.getMessage(), e);
        }
    }
}
