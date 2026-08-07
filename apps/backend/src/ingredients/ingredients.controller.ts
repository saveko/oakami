import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ListIngredientsDto } from './dto/list-ingredients.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('ingredients')
@UseGuards(JwtAuthGuard)
export class IngredientsController {
  constructor(private ingredientsService: IngredientsService) {}

  @Post('categories')
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @Request() req: any,
  ) {
    return this.ingredientsService.createCategory(req.user.organizationId, createCategoryDto);
  }

  @Get('categories')
  async listCategories(@Request() req: any) {
    return this.ingredientsService.listCategories(req.user.organizationId);
  }

  @Post()
  async create(
    @Body() createIngredientDto: CreateIngredientDto,
    @Request() req: any,
  ) {
    return this.ingredientsService.createIngredient(
      req.user.organizationId,
      createIngredientDto,
    );
  }

  @Get()
  async list(@Query() listIngredientsDto: ListIngredientsDto, @Request() req: any) {
    return this.ingredientsService.listIngredients(
      req.user.organizationId,
      listIngredientsDto,
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req: any) {
    return this.ingredientsService.findById(req.user.organizationId, id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
    @Request() req: any,
  ) {
    return this.ingredientsService.update(req.user.organizationId, id, updateIngredientDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.ingredientsService.delete(req.user.organizationId, id);
  }
}
