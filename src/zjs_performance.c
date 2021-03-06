// Copyright (c) 2016, Linaro Limited.
#ifdef BUILD_MODULE_PERFORMANCE

// ZJS includes
#include "zjs_util.h"

static jerry_value_t zjs_performance_now(const jerry_value_t function_obj,
                                         const jerry_value_t this,
                                         const jerry_value_t argv[],
                                         const jerry_length_t argc)
{
    if (argc != 0)
        return zjs_error("performance.now: no args expected");
#ifdef ZJS_LINUX_BUILD
    struct timeval tv;
    gettimeofday(&tv, NULL);
    uint64_t useconds = (uint64_t)tv.tv_sec * 1000000 + tv.tv_usec;
#else
    uint64_t useconds = (uint64_t)sys_tick_get() * (unsigned)sys_clock_us_per_tick;
#endif
    return jerry_create_number((double)useconds / 1000);
}

jerry_value_t zjs_performance_init()
{
    // create global performance object
    jerry_value_t performance_obj = jerry_create_object();
    zjs_obj_add_function(performance_obj, zjs_performance_now, "now");
    return performance_obj;
}

#endif // BUILD_MODULE_PERFORMANCE
