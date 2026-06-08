package com.playerctl.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register your custom plugin HERE
        registerPlugin(SSHPlugin.class);
        
        // Call super.onCreate LAST
        super.onCreate(savedInstanceState);
    }
}