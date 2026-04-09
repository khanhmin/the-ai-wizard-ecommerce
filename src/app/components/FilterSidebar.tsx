import { Slider } from "./ui/slider"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { getCourseCategories } from "../api/course"
import { getPromptCategories } from "../api/prompt"


interface FilterSidebarProps {
  type: "prompts" | "courses"
  // Thêm các props này để cha kiểm soát
  selectedCategories: string[]
  onCategoryToggle: (category: string) => void
  selectedRating: number
  onRatingChange: (rating: number) => void
  selectedSort: string
  onSortChange: (sort: string) => void
  onClear: () => void
}

export function FilterSidebar({
  type,
  selectedCategories,
  onCategoryToggle,
  selectedRating,
  onRatingChange,
  selectedSort,
  onSortChange,
  onClear,
}: FilterSidebarProps) {
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (type === "courses") {
          const response = await getCourseCategories()
          setCategories(response.payload)
        } else {
          const response = await getPromptCategories()
          setCategories(response.payload)
        }
      } catch (error) {
        console.log("Error fetching categories: ", error)
      }
    }
    fetchCategories()
  }, [type])

  const sortOptions = [
    "Popularity",
    "Price: Low to High",
    "Price: High to Low",
    "Rating",
  ]

  return (
    <div className="w-64 bg-card border-r p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground"
          onClick={onClear}
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Category</h4>
       
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => onCategoryToggle(category)}
                />
                <Label
                  htmlFor={`cat-${category}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
      </div>

      {/* Rating (Chỉ cho phép chọn 1 mức min) */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Min Rating</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={selectedRating === rating}
                onCheckedChange={() => onRatingChange(rating)}
              />
              <Label
                htmlFor={`rating-${rating}`}
                className="text-sm font-normal cursor-pointer"
              >
                {rating}+ Stars
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Sort By (Chỉ cho phép chọn 1) */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Sort By</h4>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`sort-${option}`}
                checked={selectedSort === option}
                onCheckedChange={() => onSortChange(option)}
              />
              <Label
                htmlFor={`sort-${option}`}
                className="text-sm font-normal cursor-pointer"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
