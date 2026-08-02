import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ListIngredientsDto } from './dto/list-ingredients.dto';

@Injectable()
export class IngredientsService {
  constructor(private db: DatabaseService) {}

  async createCategory(organizationId: string, createCategoryDto: CreateCategoryDto) {
    const existing = await this.db.wasteCategory.findFirst({
      where: {
        organizationId,
        name: createCategoryDto.name,
      },
    });

    if (existing) {
      throw new ConflictException('Category already exists');
    }

    return this.db.wasteCategory.create({
      data: {
        organizationId,
        ...createCategoryDto,
      },
    });
  }

  async listCategories(organizationId: string) {
    return this.db.wasteCategory.findMany({
      where: { organizationId, isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async createIngredient(organizationId: string, createIngredientDto: CreateIngredientDto) {
    const { categoryId, supplierId, ...rest } = createIngredientDto;

    // Verify category exists
    const category = await this.db.wasteCategory.findFirst({
      where: { id: categoryId, organizationId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Verify supplier exists (if provided)
    if (supplierId) {
      const supplier = await this.db.supplier.findFirst({
        where: { id: supplierId, organizationId },
      });

      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
    }

    // Check for duplicate name
    const existing = await this.db.ingredient.findFirst({
      where: {
        organizationId,
        name: rest.name,
      },
    });

    if (existing) {
      throw new ConflictException('Ingredient already exists');
    }

    return this.db.ingredient.create({
      data: {
        organizationId,
        categoryId,
        supplierId: supplierId || null,
        ...rest,
      },
      include: {
        category: true,
        supplier: true,
      },
    });
  }

  async listIngredients(organizationId: string, listIngredientsDto: ListIngredientsDto) {
    const {
      skip = 0,
      take = 20,
      categoryId,
      supplierId,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
    } = listIngredientsDto;

    const where: any = { organizationId };

    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [ingredients, total] = await Promise.all([
      this.db.ingredient.findMany({
        where,
        include: {
          category: true,
          supplier: true,
        },
        orderBy: {
          [sortBy]: sortOrder.toLowerCase(),
        },
        skip,
        take,
      }),
      this.db.ingredient.count({ where }),
    ]);

    return {
      data: ingredients,
      pagination: {
        total,
        skip,
        take,
        pages: Math.ceil(total / take),
      },
    };
  }

  async findById(organizationId: string, id: string) {
    const ingredient = await this.db.ingredient.findFirst({
      where: { id, organizationId },
      include: {
        category: true,
        supplier: true,
        _count: {
          select: {
            wasteRecords: true,
            inventory: true,
            purchases: true,
          },
        },
      },
    });

    if (!ingredient) {
      throw new NotFoundException('Ingredient not found');
    }

    return ingredient;
  }

  async update(organizationId: string, id: string, updateIngredientDto: UpdateIngredientDto) {
    await this.findById(organizationId, id);

    // Verify category if being updated
    if (updateIngredientDto.categoryId) {
      const category = await this.db.wasteCategory.findFirst({
        where: { id: updateIngredientDto.categoryId, organizationId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    return this.db.ingredient.update({
      where: { id },
      data: updateIngredientDto,
      include: {
        category: true,
        supplier: true,
      },
    });
  }

  async delete(organizationId: string, id: string) {
    await this.findById(organizationId, id);

    // Check for active waste records
    const wasteRecords = await this.db.wasteRecord.count({
      where: { ingredientId: id },
    });

    if (wasteRecords > 0) {
      throw new ConflictException(
        'Cannot delete ingredient with existing waste records',
      );
    }

    return this.db.ingredient.delete({
      where: { id },
    });
  }
}
