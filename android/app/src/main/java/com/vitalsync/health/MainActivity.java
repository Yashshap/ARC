package com.vitalsync.health;

import android.graphics.Color;
import android.os.Bundle;
import android.os.SystemClock;
import android.webkit.WebView;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int APP_BG_COLOR = Color.parseColor("#080c14");

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        final long startTime = SystemClock.uptimeMillis();
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);

        super.onCreate(savedInstanceState);

        // Match native window and WebView background to VitalSync dark theme (#080c14)
        getWindow().getDecorView().setBackgroundColor(APP_BG_COLOR);
        if (getBridge() != null && getBridge().getWebView() != null) {
            final WebView webView = getBridge().getWebView();
            webView.setBackgroundColor(APP_BG_COLOR);

            // Hold native splash screen ONLY until React mounts DOM & WebView paints first frame (max 700ms cap)
            splashScreen.setKeepOnScreenCondition(() -> {
                long elapsed = SystemClock.uptimeMillis() - startTime;
                if (elapsed >= 700L) {
                    return false;
                }
                boolean isHtmlLoaded = webView.getProgress() == 100;
                boolean isReactPainted = webView.getContentHeight() > 0;
                return !(isHtmlLoaded && isReactPainted);
            });
        }
    }
}

