package com.storytime.app;

import android.app.Application;
import android.content.Context;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkRequest;
import android.webkit.CookieManager;
import android.webkit.CookieSyncManager;

public class MainApplication extends Application {

    private static MainApplication instance;

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;

        // Enable cookies
        CookieSyncManager.createInstance(this);
        CookieManager.getInstance().setAcceptCookie(true);

        // Setup network monitoring
        setupNetworkMonitoring();
    }

    public static MainApplication getInstance() {
        return instance;
    }

    private void setupNetworkMonitoring() {
        ConnectivityManager connectivityManager = 
            (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);

        if (connectivityManager != null) {
            NetworkRequest networkRequest = new NetworkRequest.Builder()
                .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
                .addTransportType(NetworkCapabilities.TRANSPORT_CELLULAR)
                .build();

            connectivityManager.registerNetworkCallback(networkRequest, 
                new ConnectivityManager.NetworkCallback() {
                    @Override
                    public void onAvailable(Network network) {
                        super.onAvailable(network);
                        // Network is available - sync data
                        onNetworkAvailable();
                    }

                    @Override
                    public void onLost(Network network) {
                        super.onLost(network);
                        // Network is lost - enable offline mode
                        onNetworkLost();
                    }
                });
        }
    }

    private void onNetworkAvailable() {
        // Called when network becomes available
        // You can trigger sync here if needed
    }

    private void onNetworkLost() {
        // Called when network is lost
        // Enable offline mode
    }

    public static boolean isNetworkAvailable() {
        if (instance == null) return false;
        
        ConnectivityManager connectivityManager = 
            (ConnectivityManager) instance.getSystemService(Context.CONNECTIVITY_SERVICE);
        
        if (connectivityManager != null) {
            Network network = connectivityManager.getActiveNetwork();
            if (network != null) {
                NetworkCapabilities capabilities = 
                    connectivityManager.getNetworkCapabilities(network);
                return capabilities != null && 
                    (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
                     capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR));
            }
        }
        return false;
    }
}
