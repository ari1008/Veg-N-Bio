package com.veg.bio.restaurant.domain

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.annotation.JsonDeserialize

const val minNumberPrinter = 1
const val maxNuberPrinter = 10

class NumberPrinterDeserializer : JsonDeserializer<Printer>(){
    override fun deserialize(p: JsonParser, ctxt: DeserializationContext): Printer {
        val value = p.valueAsInt
        return Printer(value)
    }
}

@JsonDeserialize(using = NumberPrinterDeserializer::class)
@JvmInline
value class Printer(val value: Int){
    init {
        require(value >= minNumberPrinter){
            "Require min $minNumberPrinter"
        }
        require(value <= maxNuberPrinter){
            "Require max $maxNuberPrinter"
        }
    }
}
