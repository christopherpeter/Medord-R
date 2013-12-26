package org.apache.cordova.plugin;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.ContentResolver;
import android.database.Cursor;
import android.net.Uri;
import android.util.Log;


public class SMSReader extends CordovaPlugin {
    private static final String TAG = "ReadSmsPlugin";
    private static final String GET_TEXTS_ACTION = "GetTexts";
    

    // Defaults:
    private static final Integer READ_ALL = -1;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        Log.d(TAG, "Inside ReadSms plugin.");

        JSONObject result = new JSONObject();

        String phoneNumber = args.getString(0);
        result.put("phone_number", phoneNumber);

        if (action.equals("") || action.equals(GET_TEXTS_ACTION)) {
            return getTexts(args, callbackContext, result, phoneNumber);
        }  else {
            Log.e(TAG, "Unknown action provided.");
            result.put("error", "Unknown action provided.");
            callbackContext.success(result);
            return false;
        }
    }
    
    private boolean getTexts(JSONArray args, CallbackContext callbackContext,
            JSONObject result, String phoneNumber) throws JSONException {
        Log.d(TAG, "Get texts from specified number.");
        Integer numberOfTexts = READ_ALL; // Default
        if (args.length() >= 2) { // We want numberOfTexts to be the second one
            Log.d(TAG, "Setting maximum number of texts to retrieve.");
            try {
                numberOfTexts = Integer.valueOf(args.getString(1));
            } catch (NumberFormatException nfe) {
                String errorMessage =  String.format("Input provided (%s) is not a number",
                        args.getString(1));
                Log.e(TAG, errorMessage);
                result.put("error", errorMessage);
                return false;
            }
            if (numberOfTexts <= 0) {
                numberOfTexts = READ_ALL;
            }
        }

        JSONArray readResults = readTextsFrom(phoneNumber, numberOfTexts);
        Log.d(TAG, "read results: " + readResults.toString());
        result.put("texts", readResults);
        callbackContext.success(result);
        return true;
    }

    private JSONArray readTextsFrom(String numberToCheck, Integer numberOfTexts
            ) throws JSONException {
        ContentResolver contentResolver = cordova.getActivity().getContentResolver();
       
        Cursor cursor = contentResolver.query(Uri.parse("content://sms/inbox"), null,
               null,null,null);

        JSONArray results = new JSONArray();
        while (cursor.moveToNext()) {
            JSONObject current = new JSONObject();
            try {
                current.put("time_received", cursor.getString(cursor.getColumnIndex("date")));
                current.put("message", cursor.getString(cursor.getColumnIndex("body")));
                current.put("number", cursor.getString(cursor.getColumnIndex("address")));
                
                Log.d(TAG, "time: " + cursor.getString(cursor.getColumnIndex("date"))
                        + " message: " + cursor.getString(cursor.getColumnIndex("body")));
            } catch (JSONException e) {
                e.printStackTrace();
                current.put("error", new String("Error reading text"));
            }
            results.put(current);
        }

        return results;
    }
}