package com.kanchaeum.sudoku;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

public class MainActivity extends Activity {

    private static final String APP_URL = "https://numero-quest.pages.dev";
    private static final String APP_HOST = "numero-quest.pages.dev";
    private WebView webView;
    private FrameLayout splashView;
    private boolean isLoaded = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setupWindow();
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        splashView = findViewById(R.id.splash);

        setupWebView();

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(APP_URL);
        }
    }

    private void setupWindow() {
        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(getResources().getColor(R.color.colorPrimary, null));
        window.setNavigationBarColor(getResources().getColor(R.color.navigationColor, null));

        // Dark status bar icons = false (we want light icons on dark bg)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            window.getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            );
        }
    }

    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setAllowFileAccess(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setTextZoom(100);

        // Support for service workers
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(false);
        }

        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                hideSplash();
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.contains(APP_HOST)) {
                    return false;
                }
                // Open external URLs in browser
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                } catch (Exception ignored) {
                }
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    loadOfflinePage(view);
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient());
    }

    private void hideSplash() {
        if (!isLoaded && splashView != null) {
            isLoaded = true;
            splashView.animate()
                .alpha(0f)
                .setDuration(300)
                .withEndAction(() -> {
                    splashView.setVisibility(View.GONE);
                    webView.setVisibility(View.VISIBLE);
                })
                .start();
        }
    }

    private void loadOfflinePage(WebView view) {
        String html = "<!DOCTYPE html><html><head>"
            + "<meta charset='UTF-8'>"
            + "<meta name='viewport' content='width=device-width,initial-scale=1'>"
            + "<style>"
            + "body{font-family:sans-serif;background:#0F172A;color:#fff;"
            + "display:flex;flex-direction:column;align-items:center;"
            + "justify-content:center;height:100vh;margin:0;text-align:center;}"
            + "h1{font-size:22px;margin-bottom:12px;}"
            + "p{color:#94a3b8;margin-bottom:24px;font-size:14px;}"
            + "button{background:#4F46E5;color:white;border:none;"
            + "padding:14px 32px;border-radius:12px;font-size:16px;"
            + "font-weight:600;cursor:pointer;}"
            + "</style></head><body>"
            + "<h1>&#128268; &#51064;&#53552;&#45367; &#50672;&#44208; &#50630;&#51020;</h1>"
            + "<p>&#51064;&#53552;&#45367;&#50640; &#50672;&#44208;&#54620; &#54980; &#45796;&#49884; &#49884;&#46020;&#54644;&#51452;&#49464;&#50836;.</p>"
            + "<button onclick='location.reload()'>&#45796;&#49884; &#49884;&#46020;</button>"
            + "</body></html>";
        view.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
        hideSplash();
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView != null && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) {
            webView.saveState(outState);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
        }
        super.onDestroy();
    }
}
