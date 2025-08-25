package com.veg.bio.menu

import com.veg.bio.infrastructure.table.DishEntity
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID


@RestController
@RequestMapping("/api/notprotected/menu")
class MenuNotPrivateController(
    private val menuService: MenuService
) {


    @GetMapping()
    fun getAllDish(): ResponseEntity<List<DishEntity>>{
        val allDish = menuService.listAllDish()
        return ResponseEntity.ok().body(allDish)
    }

    @GetMapping("/{id}")
    fun getOneDish(
        @PathVariable id: UUID,
    ): ResponseEntity<DishEntity>{
        val dish = menuService.findOneDish(id)
        return ResponseEntity.ok().body(dish)
    }


}