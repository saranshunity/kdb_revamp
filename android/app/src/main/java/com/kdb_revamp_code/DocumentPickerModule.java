package com.kdb_revamp_code;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.provider.OpenableColumns;
import android.database.Cursor;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;

public class DocumentPickerModule extends ReactContextBaseJavaModule {
    private static final int PICK_DOCUMENT = 1;
    private Promise promise;

    private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (requestCode == PICK_DOCUMENT && promise != null) {
                if (resultCode == Activity.RESULT_CANCELED) {
                    promise.reject("CANCELLED", "User cancelled");
                    promise = null;
                    return;
                }

                if (resultCode == Activity.RESULT_OK && data != null) {
                    Uri uri = data.getData();
                    try {
                        WritableMap result = getFileData(uri);
                        promise.resolve(result);
                    } catch (Exception e) {
                        promise.reject("ERROR", e.getMessage());
                    }
                    promise = null;
                }
            }
        }
    };

    public DocumentPickerModule(ReactApplicationContext context) {
        super(context);
        context.addActivityEventListener(activityEventListener);
    }

    @Override
    public String getName() {
        return "DocumentPicker";
    }

    @ReactMethod
    public void pick(Promise promise) {
        this.promise = promise;
        
        Activity activity = getCurrentActivity();
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity not found");
            return;
        }

        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("*/*");
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        
        String[] mimeTypes = {
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/*",
            "text/*"
        };
        intent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes);

        activity.startActivityForResult(intent, PICK_DOCUMENT);
    }

    private WritableMap getFileData(Uri uri) throws Exception {
        WritableMap map = new WritableNativeMap();
        
        Cursor cursor = getReactApplicationContext()
            .getContentResolver()
            .query(uri, null, null, null, null);
        
        String fileName = "document";
        long fileSize = 0;
        
        if (cursor != null && cursor.moveToFirst()) {
            int nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
            int sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE);
            
            if (nameIndex != -1) {
                fileName = cursor.getString(nameIndex);
            }
            if (sizeIndex != -1) {
                fileSize = cursor.getLong(sizeIndex);
            }
            cursor.close();
        }
        
        // Copy to cache
        File cacheDir = getReactApplicationContext().getCacheDir();
        File file = new File(cacheDir, fileName);
        
        InputStream input = getReactApplicationContext()
            .getContentResolver()
            .openInputStream(uri);
        FileOutputStream output = new FileOutputStream(file);
        
        byte[] buffer = new byte[4096];
        int read;
        while ((read = input.read(buffer)) != -1) {
            output.write(buffer, 0, read);
        }
        
        output.close();
        input.close();
        
        map.putString("uri", "file://" + file.getAbsolutePath());
        map.putString("name", fileName);
        map.putDouble("size", fileSize);
        map.putString("type", getReactApplicationContext()
            .getContentResolver()
            .getType(uri));
        
        return map;
    }
}
