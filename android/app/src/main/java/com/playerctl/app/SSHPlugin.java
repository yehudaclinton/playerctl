package com.playerctl.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Properties;

@CapacitorPlugin(name = "SSH")
public class SSHPlugin extends Plugin {

    @PluginMethod()
    public void execute(PluginCall call) {
        String host = call.getString("host");
        String user = call.getString("user");
        String password = call.getString("password");
        String command = call.getString("command");
        int port = call.getInt("port", 22);

        new Thread(() -> {
            try {
                JSch jsch = new JSch();
                Session session = jsch.getSession(user, host, port);
                session.setPassword(password);

                Properties config = new Properties();
                config.put("StrictHostKeyChecking", "no");
                session.setConfig(config);
                session.connect();

                ChannelExec channel = (ChannelExec) session.openChannel("exec");
                channel.setCommand(command);
                channel.connect();

                BufferedReader reader = new BufferedReader(new InputStreamReader(channel.getInputStream()));
                StringBuilder output = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }

                channel.disconnect();
                session.disconnect();

                JSObject ret = new JSObject();
                ret.put("output", output.toString());
                call.resolve(ret);

            } catch (Exception e) {
                call.reject("SSH Error: " + e.getMessage());
            }
        }).start();
    }
}   