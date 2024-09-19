package com.tradingapp.hft;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class Controller {
    
    @GetMapping("/testjava/{name}")
    public String getTest(@PathVariable String name) {
        return "hello, your name is " + name;
    }
    
}
